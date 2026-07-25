import type { CreditSettings, CreditSimulationResult, CreditSimulationRow, Motor } from "@/lib/types";

/**
 * Simulasi kredit motor — port dari rumus Excel "Tools UMC SOF SUMUT Area
 * with PGI & Oona Insurance" (sheet Tools + Sheet3).
 *
 * Alur (mengikuti Sheet3 baris 30-39, kolom N-U):
 *  1. DP efektif = DP input pembeli + subsidi/diskon DP yang diatur admin
 *     per motor (motor.dp_discount).
 *  2. Pokok pencairan = OTR (harga motor) - DP efektif.
 *  3. Untuk setiap tenor:
 *     - Premi asuransi kendaraan = rate interpolasi(tenor) * OTR
 *     - Premi jiwa = base premium * jumlah tahun tenor (dibulatkan ke atas)
 *     - Premi PGI = 0 kalau model motor ada di daftar exclusion, else flat
 *     - Oona & biaya admin = flat
 *     - Total pokok yang diangsur = pokok pencairan + semua premi/biaya di atas
 *     - Bunga per tahun dari tabel financing_rates (per tenor)
 *     - Angsuran = PMT(bunga/12, tenor, -totalPokok, 0) dibulatkan ke atas
 *       ke ribuan terdekat
 *     - Angsuran pertama = angsuran - potongan angsuran pertama (promo)
 */

export class CreditCalcError extends Error {}

/** Replikasi fungsi PMT Excel (annuity-due jika type=1, default type=0). */
function pmt(rate: number, nper: number, pv: number, fv = 0, type: 0 | 1 = 0): number {
  if (rate === 0) return -(pv + fv) / nper;
  const pow = Math.pow(1 + rate, nper);
  return (-(fv + pv * pow) * rate) / ((pow - 1) * (1 + rate * type));
}

function roundUpToThousand(value: number): number {
  return Math.ceil(value / 1000) * 1000;
}

/**
 * Interpolasi tarif premi asuransi kendaraan berdasarkan tenor, mengikuti
 * pola Sheet3!N27:W27 — tiga titik anchor (12/24/36 bulan) dengan kenaikan
 * per bulan tambahan di setiap segmen.
 */
export function vehicleInsuranceRate(tenor: number, s: CreditSettings): number {
  if (tenor >= 36) {
    return s.vehicle_insurance_rate_36 + s.vehicle_insurance_monthly_36_plus * (tenor - 36);
  }
  if (tenor >= 24) {
    return s.vehicle_insurance_rate_24 + s.vehicle_insurance_monthly_24_35 * (tenor - 24);
  }
  if (tenor >= 12) {
    return s.vehicle_insurance_rate_12 + s.vehicle_insurance_monthly_12_23 * (tenor - 12);
  }
  return s.vehicle_insurance_monthly_below_12 * tenor;
}

function isPgiExcluded(motor: Pick<Motor, "model" | "variant">, s: CreditSettings): boolean {
  const excluded = new Set(s.pgi_excluded_models.map((m) => m.trim().toUpperCase()));
  const candidates = [motor.model, motor.variant].filter(Boolean).map((v) => v!.trim().toUpperCase());
  return candidates.some((c) => excluded.has(c));
}

export interface SimulateCreditInput {
  motor: Pick<Motor, "model" | "variant" | "price" | "dp_discount">;
  settings: CreditSettings;
  dpInput: number;
}

export function simulateCredit({ motor, settings, dpInput }: SimulateCreditInput): CreditSimulationResult {
  const otr = motor.price;
  if (!otr || otr <= 0) {
    throw new CreditCalcError("Harga motor belum tersedia.");
  }
  if (dpInput < 0) {
    throw new CreditCalcError("DP tidak boleh negatif.");
  }

  const dpDiscount = motor.dp_discount ?? 0;
  const dpEffective = dpInput + dpDiscount;
  const dpPercent = dpEffective / otr;

  if (dpPercent < settings.min_dp_percent) {
    throw new CreditCalcError(
      `DP kurang. Minimum DP adalah ${Math.round(settings.min_dp_percent * 100)}% dari harga OTR ` +
        `(≈ Rp${Math.ceil((otr * settings.min_dp_percent - dpDiscount) / 1000) * 1000}).`
    );
  }
  if (dpEffective >= otr) {
    throw new CreditCalcError("DP sudah menutupi seluruh harga motor — tidak perlu kredit.");
  }

  const pgiExcluded = isPgiExcluded(motor, settings);
  const financedPrincipalBase = otr - dpEffective;

  const rows: CreditSimulationRow[] = settings.tenors.map((tenor) => {
    const vehicleInsurance = Math.round(vehicleInsuranceRate(tenor, settings) * otr);
    const tenorYears = Math.ceil(tenor / 12);
    const lifeInsurance = settings.life_insurance_base_premium * tenorYears;
    const pgi = pgiExcluded ? 0 : settings.pgi_premium;
    const oona = settings.oona_premium;
    const adminFee = settings.admin_fee;

    const totalPrincipal =
      financedPrincipalBase + vehicleInsurance + lifeInsurance + pgi + oona + adminFee;

    const annualRatePercent = settings.financing_rates[String(tenor)] ?? 0;
    const monthlyRate = annualRatePercent / 100 / 12;

    const rawInstallment = pmt(monthlyRate, tenor, -totalPrincipal, 0);
    const monthlyInstallment = roundUpToThousand(rawInstallment);
    const firstInstallment = Math.max(0, monthlyInstallment - settings.first_installment_discount);

    return {
      tenor,
      vehicle_insurance: vehicleInsurance,
      life_insurance: lifeInsurance,
      pgi,
      oona,
      admin_fee: adminFee,
      annual_rate_percent: annualRatePercent,
      monthly_installment: monthlyInstallment,
      first_installment: firstInstallment,
    };
  });

  return {
    otr,
    dp_input: dpInput,
    dp_discount: dpDiscount,
    dp_effective: dpEffective,
    dp_percent: dpPercent,
    financed_principal: financedPrincipalBase,
    rows,
  };
}
