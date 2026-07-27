import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MotorsPage from './pages/MotorsPage';
import MotorDetailPage from './pages/MotorDetailPage';
import PenjualanPage from './pages/PenjualanPage';
import PengeluaranPage from './pages/PengeluaranPage';
import LaporanPage from './pages/LaporanPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/motors" element={<MotorsPage />} />
          <Route path="/motors/:id" element={<MotorDetailPage />} />
          <Route path="/penjualan" element={<PenjualanPage />} />
          <Route path="/pengeluaran" element={<PengeluaranPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
