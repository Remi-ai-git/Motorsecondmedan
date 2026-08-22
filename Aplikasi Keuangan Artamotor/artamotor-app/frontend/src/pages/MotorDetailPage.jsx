import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMotor, addBiayaPerbaikan, deleteBiayaPerbaikan } from '../api/motors';
import { createPenjualan } from '../api/penjualan';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import formatRupiah from '../utils/formatRupiah';

const EMPTY_BIAYA_FORM = { tanggal: '', deskripsi: '', jumlahBiaya: '' };
const EMPTY_JUAL_FORM = {
  tanggalPenjualan: '',
  hargaJual: '',
  namaPembeli: '',
  noTeleponPembeli: '',
  metodePembayaran: 'CASH',
  namaLeasing: '',
  keterangan: '',
};

export default function MotorDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [motor, setMotor] = useState(null);
  const [error, setError] = useState('');

  const [showBiayaForm, setShowBiayaForm] = useState(false);
  const [biayaForm, setBiayaForm] = useState(EMPTY_BIAYA_FORM);

  const [showJualForm, setShowJualForm] = useState(false);
  const [jualForm, setJualForm] = useState(EMPTY_JUAL_FORM);

  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await getMotor(id);
      setMotor(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail motor');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddBiaya(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await addBiayaPerbaikan(id, { ...biayaForm, jumlahBiaya: Number(biayaForm.jumlahBiaya) });
      setShowBiayaForm(false);
      setBiayaForm(EMPTY_BIAYA_FORM);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menambah biaya perbaikan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBiaya(biayaId) {
    if (!window.confirm('Hapus baris biaya perbaikan ini?')) return;
    try {
      await deleteBiayaPerbaikan(id, biayaId);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus biaya perbaikan');
    }
  }

  async function handleJual(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createPenjualan({ ...jualForm, motorId: id, hargaJual: Number(jualForm.hargaJual) });
      setShowJualForm(false);
      setJualForm(EMPTY_JUAL_FORM);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal mencatat penjualan');
    } finally {
      setSaving(false);
    }
  }

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!motor) return <p>Memuat...</p>;

  const totalBiaya = motor.biayaPerbaikan.reduce((sum, b) => sum + Number(b.jumlahBiaya), 0);

  return (
    <div>
      <Link to="/motors" className="back-link">
        &larr; Kembali ke Inventaris
      </Link>

      <div className="page-header">
        <h1>
          {motor.kodeMotor} — {motor.merek} {motor.tipe}
        </h1>
        <StatusBadge status={motor.status} />
      </div>

      <div className="detail-grid">
        <div>
          <span className="detail-label">Tahun</span>
          <div>{motor.tahunPembuatan}</div>
        </div>
        <div>
          <span className="detail-label">Plat Nomor</span>
          <div>{motor.platNomor}</div>
        </div>
        <div>
          <span className="detail-label">Harga Beli</span>
          <div>{formatRupiah(motor.hargaBeli)}</div>
        </div>
        <div>
          <span className="detail-label">Total Biaya Perbaikan</span>
          <div>{formatRupiah(totalBiaya)}</div>
        </div>
        <div>
          <span className="detail-label">Modal</span>
          <div>{formatRupiah(Number(motor.hargaBeli) + totalBiaya)}</div>
        </div>
      </div>

      <section className="section-block">
        <div className="page-header">
          <h2>Biaya Perbaikan</h2>
          {motor.status === 'TERSEDIA' && (
            <button type="button" className="btn btn-secondary" onClick={() => setShowBiayaForm(true)}>
              + Tambah Biaya
            </button>
          )}
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {motor.biayaPerbaikan.map((b) => (
              <tr key={b.id}>
                <td>{new Date(b.tanggal).toLocaleDateString('id-ID')}</td>
                <td>{b.deskripsi}</td>
                <td>{formatRupiah(b.jumlahBiaya)}</td>
                <td>
                  {user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      className="btn-link btn-link-danger"
                      onClick={() => handleDeleteBiaya(b.id)}
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {motor.biayaPerbaikan.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-row">
                  Belum ada biaya perbaikan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="section-block">
        <h2>Penjualan</h2>
        {motor.penjualan ? (
          <div className="detail-grid">
            <div>
              <span className="detail-label">Tanggal Jual</span>
              <div>{new Date(motor.penjualan.tanggalPenjualan).toLocaleDateString('id-ID')}</div>
            </div>
            <div>
              <span className="detail-label">Harga Jual</span>
              <div>{formatRupiah(motor.penjualan.hargaJual)}</div>
            </div>
            <div>
              <span className="detail-label">Pembeli</span>
              <div>{motor.penjualan.namaPembeli}</div>
            </div>
            <div>
              <span className="detail-label">Metode Bayar</span>
              <div>{motor.penjualan.metodePembayaran}</div>
            </div>
            <div>
              <span className="detail-label">Laba/Rugi</span>
              <div className={Number(motor.penjualan.hargaJual) - Number(motor.hargaBeli) - totalBiaya < 0 ? 'text-danger' : 'text-success'}>
                {formatRupiah(Number(motor.penjualan.hargaJual) - Number(motor.hargaBeli) - totalBiaya)}
              </div>
            </div>
          </div>
        ) : (
          <>
            <p>Motor ini belum terjual.</p>
            <button type="button" className="btn btn-primary" onClick={() => setShowJualForm(true)}>
              Catat Penjualan
            </button>
          </>
        )}
      </section>

      {showBiayaForm && (
        <Modal title="Tambah Biaya Perbaikan" onClose={() => setShowBiayaForm(false)}>
          <form onSubmit={handleAddBiaya} className="form-grid">
            {formError && <div className="alert alert-error form-grid-full">{formError}</div>}
            <label>
              Tanggal
              <input
                required
                type="date"
                value={biayaForm.tanggal}
                onChange={(e) => setBiayaForm({ ...biayaForm, tanggal: e.target.value })}
              />
            </label>
            <label>
              Jumlah Biaya (Rp)
              <input
                required
                type="number"
                min="0"
                value={biayaForm.jumlahBiaya}
                onChange={(e) => setBiayaForm({ ...biayaForm, jumlahBiaya: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              Deskripsi
              <input
                required
                value={biayaForm.deskripsi}
                onChange={(e) => setBiayaForm({ ...biayaForm, deskripsi: e.target.value })}
              />
            </label>
            <div className="form-actions form-grid-full">
              <button type="button" className="btn btn-ghost" onClick={() => setShowBiayaForm(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showJualForm && (
        <Modal title="Catat Penjualan" onClose={() => setShowJualForm(false)}>
          <form onSubmit={handleJual} className="form-grid">
            {formError && <div className="alert alert-error form-grid-full">{formError}</div>}
            <label>
              Tanggal Penjualan
              <input
                required
                type="date"
                value={jualForm.tanggalPenjualan}
                onChange={(e) => setJualForm({ ...jualForm, tanggalPenjualan: e.target.value })}
              />
            </label>
            <label>
              Harga Jual (Rp)
              <input
                required
                type="number"
                min="0"
                value={jualForm.hargaJual}
                onChange={(e) => setJualForm({ ...jualForm, hargaJual: e.target.value })}
              />
            </label>
            <label>
              Nama Pembeli
              <input
                required
                value={jualForm.namaPembeli}
                onChange={(e) => setJualForm({ ...jualForm, namaPembeli: e.target.value })}
              />
            </label>
            <label>
              No. Telepon Pembeli
              <input
                value={jualForm.noTeleponPembeli}
                onChange={(e) => setJualForm({ ...jualForm, noTeleponPembeli: e.target.value })}
              />
            </label>
            <label>
              Metode Pembayaran
              <select
                value={jualForm.metodePembayaran}
                onChange={(e) => setJualForm({ ...jualForm, metodePembayaran: e.target.value })}
              >
                <option value="CASH">Cash</option>
                <option value="KREDIT">Kredit</option>
              </select>
            </label>
            {jualForm.metodePembayaran === 'KREDIT' && (
              <label>
                Nama Leasing
                <input
                  required
                  value={jualForm.namaLeasing}
                  onChange={(e) => setJualForm({ ...jualForm, namaLeasing: e.target.value })}
                />
              </label>
            )}
            <label className="form-grid-full">
              Keterangan
              <textarea
                value={jualForm.keterangan}
                onChange={(e) => setJualForm({ ...jualForm, keterangan: e.target.value })}
              />
            </label>
            <div className="form-actions form-grid-full">
              <button type="button" className="btn btn-ghost" onClick={() => setShowJualForm(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
