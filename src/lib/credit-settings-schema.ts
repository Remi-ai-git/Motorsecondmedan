import { z } from "zod";

/** Skema PATCH manual credit_settings — dipakai client (form) & server (API). */
export const creditSettingsInputSchema = z.object({
  min_dp_percent: z.coerce.number().min(0).max(1),
  vehicle_insurance_rate_12: z.coerce.number().min(0),
  vehicle_insurance_rate_24: z.coerce.number().min(0),
  vehicle_insurance_rate_36: z.coerce.number().min(0),
  vehicle_insurance_monthly_below_12: z.coerce.number().min(0),
  vehicle_insurance_monthly_12_23: z.coerce.number().min(0),
  vehicle_insurance_monthly_24_35: z.coerce.number().min(0),
  vehicle_insurance_monthly_36_plus: z.coerce.number().min(0),
  life_insurance_base_premium: z.coerce.number().min(0),
  pgi_premium: z.coerce.number().min(0),
  pgi_excluded_models: z.array(z.string()).default([]),
  oona_premium: z.coerce.number().min(0),
  admin_fee: z.coerce.number().min(0),
  first_installment_discount: z.coerce.number().min(0),
  financing_rates: z.record(z.string(), z.coerce.number().min(0)),
  tenors: z.array(z.coerce.number().int().positive()).min(1),
  effective_from: z.string().optional().nullable(),
  effective_until: z.string().optional().nullable(),
});

export type CreditSettingsInput = z.infer<typeof creditSettingsInputSchema>;
