import { useEffect, useState } from 'react';
import { getDashboard } from '../api/laporan';
import formatRupiah from '../utils/formatRupiah';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat dashboard'));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p>Memuat...</p>;

  const cards = [
    { label: 'Motor Tersedia', value: data.totalMotorTersedia },
    { label: 'Motor Terjual Bulan Ini', value: data.totalMotorTerjualBulanIni },
    { label: 'Pendapatan Bulan Ini', value: formatRupiah(data.totalPendapatanBulanIni) },
    { label: 'Estimasi Laba Bersih Bulan Ini', value: formatRupiah(data.estimasiLabaBersihBulanIni) },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card-grid">
        {cards.map((c) => (
          <div className="summary-card" key={c.label}>
            <div className="summary-value">{c.value}</div>
            <div className="summary-label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
