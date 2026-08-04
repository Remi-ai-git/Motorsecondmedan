import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPenjualan, deletePenjualan } from '../api/penjualan';
import { useAuth } from '../context/AuthContext';
import formatRupiah from '../utils/formatRupiah';

export default function PenjualanPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [metodePembayaran, setMetodePembayaran] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await listPenjualan({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        metodePembayaran: metodePembayaran || undefined,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data penjualan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(item) {
    if (
      !window.confirm(
        `Batalkan transaksi penjualan ${item.motor.kodeMotor}? Motor akan kembali berstatus Tersedia.`,
      )
    )
      return;
    try {
      await deletePenjualan(item.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan transaksi');
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Transaksi Penjualan</h1>
        <Link to="/motors?status=TERSEDIA" className="btn btn-primary">
          + Catat Penjualan Baru
        </Link>
      </div>
      <p className="hint-text">
        Untuk mencatat penjualan baru, buka detail motor yang berstatus Tersedia lalu klik &quot;Catat
        Penjualan&quot;.
      </p>

      <form className="filter-bar" onSubmit={handleFilterSubmit}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <select value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)}>
          <option value="">Semua Metode</option>
          <option value="CASH">Cash</option>
          <option value="KREDIT">Kredit</option>
        </select>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Motor</th>
              <th>Pembeli</th>
              <th>Harga Jual</th>
              <th>Metode</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.tanggalPenjualan).toLocaleDateString('id-ID')}</td>
                <td>
                  <Link to={`/motors/${p.motor.id}`}>
                    {p.motor.kodeMotor} — {p.motor.merek} {p.motor.tipe}
                  </Link>
                </td>
                <td>{p.namaPembeli}</td>
                <td>{formatRupiah(p.hargaJual)}</td>
                <td>{p.metodePembayaran}</td>
                <td>
                  {user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      className="btn-link btn-link-danger"
                      onClick={() => handleDelete(p)}
                    >
                      Batalkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  Belum ada transaksi penjualan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {meta && <p className="meta-info">Total {meta.total} transaksi</p>}
    </div>
  );
}
