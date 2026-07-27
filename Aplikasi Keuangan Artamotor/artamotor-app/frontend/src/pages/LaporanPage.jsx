import { useState } from 'react';
import { getLabaPerUnit, getBulanan, downloadExport } from '../api/laporan';
import formatRupiah from '../utils/formatRupiah';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function LaporanPage() {
  const [tab, setTab] = useState('unit');

  return (
    <div>
      <h1>Laporan Keuangan</h1>
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn${tab === 'unit' ? ' active' : ''}`}
          onClick={() => setTab('unit')}
        >
          Laba per Unit
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'bulanan' ? ' active' : ''}`}
          onClick={() => setTab('bulanan')}
        >
          Laba/Rugi Bulanan
        </button>
      </div>
      {tab === 'unit' ? <LabaPerUnitTab /> : <BulananTab />}
    </div>
  );
}

function LabaPerUnitTab() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await getLabaPerUnit({ startDate: startDate || undefined, endDate: endDate || undefined });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format) {
    try {
      await downloadExport(
        `/laporan/export/laba-per-unit/${format}`,
        { startDate: startDate || undefined, endDate: endDate || undefined },
        `laba-per-unit.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    } catch (err) {
      alert('Gagal mengunduh file laporan');
    }
  }

  return (
    <div>
      <form className="filter-bar" onSubmit={load}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button type="submit" className="btn btn-secondary">
          Tampilkan
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => handleExport('excel')}>
          Export Excel
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => handleExport('pdf')}>
          Export PDF
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Memuat...</p>}

      {data && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Merek/Tipe</th>
                <th>Tgl Jual</th>
                <th>Harga Beli</th>
                <th>Biaya Perbaikan</th>
                <th>Harga Jual</th>
                <th>Laba/Rugi</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.motorId}>
                  <td>{r.kodeMotor}</td>
                  <td>
                    {r.merek} {r.tipe}
                  </td>
                  <td>{new Date(r.tanggalPenjualan).toLocaleDateString('id-ID')}</td>
                  <td>{formatRupiah(r.hargaBeli)}</td>
                  <td>{formatRupiah(r.totalBiayaPerbaikan)}</td>
                  <td>{formatRupiah(r.hargaJual)}</td>
                  <td className={r.laba < 0 ? 'text-danger' : 'text-success'}>{formatRupiah(r.laba)}</td>
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-row">
                    Tidak ada data pada rentang ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="meta-info">
            <strong>Total Laba/Rugi: {formatRupiah(data.totalLaba)}</strong> ({data.jumlahUnit} unit)
          </p>
        </>
      )}
    </div>
  );
}

function BulananTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await getBulanan({ year, month });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat laporan bulanan');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format) {
    try {
      await downloadExport(
        `/laporan/export/bulanan/${format}`,
        { year, month },
        `laba-rugi-${year}-${String(month).padStart(2, '0')}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
      );
    } catch (err) {
      alert('Gagal mengunduh file laporan');
    }
  }

  return (
    <div>
      <form className="filter-bar" onSubmit={load}>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTHS.map((label, idx) => (
            <option key={label} value={idx + 1}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 90 }}
        />
        <button type="submit" className="btn btn-secondary">
          Tampilkan
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => handleExport('excel')}>
          Export Excel
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => handleExport('pdf')}>
          Export PDF
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Memuat...</p>}

      {data && (
        <>
          <div className="card-grid">
            <div className="summary-card">
              <div className="summary-value">{data.jumlahUnitTerjual}</div>
              <div className="summary-label">Unit Terjual</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatRupiah(data.totalLabaKotor)}</div>
              <div className="summary-label">Laba Kotor</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{formatRupiah(data.totalPengeluaranOperasional)}</div>
              <div className="summary-label">Pengeluaran Operasional</div>
            </div>
            <div className="summary-card">
              <div className={`summary-value ${data.labaBersih < 0 ? 'text-danger' : 'text-success'}`}>
                {formatRupiah(data.labaBersih)}
              </div>
              <div className="summary-label">Laba Bersih</div>
            </div>
          </div>

          <h3>Rincian Penjualan</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Merek/Tipe</th>
                <th>Tgl Jual</th>
                <th>Laba/Rugi</th>
              </tr>
            </thead>
            <tbody>
              {data.rincianPenjualan.map((r) => (
                <tr key={r.motorId}>
                  <td>{r.kodeMotor}</td>
                  <td>
                    {r.merek} {r.tipe}
                  </td>
                  <td>{new Date(r.tanggalPenjualan).toLocaleDateString('id-ID')}</td>
                  <td className={r.laba < 0 ? 'text-danger' : 'text-success'}>{formatRupiah(r.laba)}</td>
                </tr>
              ))}
              {data.rincianPenjualan.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Tidak ada penjualan bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>Rincian Pengeluaran</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {data.rincianPengeluaran.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>{p.kategori}</td>
                  <td>{p.deskripsi}</td>
                  <td>{formatRupiah(p.jumlah)}</td>
                </tr>
              ))}
              {data.rincianPengeluaran.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-row">
                    Tidak ada pengeluaran bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
