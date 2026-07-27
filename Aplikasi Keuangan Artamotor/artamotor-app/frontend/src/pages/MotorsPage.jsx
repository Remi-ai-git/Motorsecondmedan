import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listMotors, createMotor, updateMotor, deleteMotor } from '../api/motors';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import formatRupiah from '../utils/formatRupiah';

const EMPTY_FORM = {
  merek: '',
  tipe: '',
  tahunPembuatan: new Date().getFullYear(),
  platNomor: '',
  noRangka: '',
  noMesin: '',
  warna: '',
  hargaBeli: '',
  keterangan: '',
};

export default function MotorsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [motors, setMotors] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null); // null | 'new' | motor object
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await listMotors({ status: status || undefined, search: search || undefined });
      setMotors(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data motor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing('new');
  }

  function openEdit(motor) {
    setForm({
      merek: motor.merek,
      tipe: motor.tipe,
      tahunPembuatan: motor.tahunPembuatan,
      platNomor: motor.platNomor,
      noRangka: motor.noRangka || '',
      noMesin: motor.noMesin || '',
      warna: motor.warna || '',
      hargaBeli: motor.hargaBeli,
      keterangan: motor.keterangan || '',
    });
    setFormError('');
    setEditing(motor);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        tahunPembuatan: Number(form.tahunPembuatan),
        hargaBeli: Number(form.hargaBeli),
      };
      if (editing === 'new') {
        await createMotor(payload);
      } else {
        await updateMotor(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data motor');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(motor) {
    if (!window.confirm(`Hapus motor ${motor.kodeMotor}?`)) return;
    try {
      await deleteMotor(motor.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus motor');
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Inventaris Motor</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Tambah Motor
        </button>
      </div>

      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="TERSEDIA">Tersedia</option>
          <option value="TERJUAL">Terjual</option>
        </select>
        <input
          type="text"
          placeholder="Cari merek, tipe, plat, atau kode motor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          Cari
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Merek/Tipe</th>
              <th>Tahun</th>
              <th>Plat Nomor</th>
              <th>Harga Beli</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {motors.map((m) => (
              <tr key={m.id}>
                <td>
                  <Link to={`/motors/${m.id}`}>{m.kodeMotor}</Link>
                </td>
                <td>
                  {m.merek} {m.tipe}
                </td>
                <td>{m.tahunPembuatan}</td>
                <td>{m.platNomor}</td>
                <td>{formatRupiah(m.hargaBeli)}</td>
                <td>
                  <StatusBadge status={m.status} />
                </td>
                <td className="table-actions">
                  <button type="button" className="btn-link" onClick={() => openEdit(m)}>
                    Edit
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      className="btn-link btn-link-danger"
                      onClick={() => handleDelete(m)}
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {motors.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">
                  Belum ada data motor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {meta && <p className="meta-info">Total {meta.total} motor</p>}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Tambah Motor' : `Edit ${editing.kodeMotor}`}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit} className="form-grid">
            {formError && <div className="alert alert-error form-grid-full">{formError}</div>}
            <label>
              Merek
              <input
                required
                value={form.merek}
                onChange={(e) => setForm({ ...form, merek: e.target.value })}
              />
            </label>
            <label>
              Tipe
              <input
                required
                value={form.tipe}
                onChange={(e) => setForm({ ...form, tipe: e.target.value })}
              />
            </label>
            <label>
              Tahun Pembuatan
              <input
                required
                type="number"
                value={form.tahunPembuatan}
                onChange={(e) => setForm({ ...form, tahunPembuatan: e.target.value })}
              />
            </label>
            <label>
              Plat Nomor
              <input
                required
                value={form.platNomor}
                onChange={(e) => setForm({ ...form, platNomor: e.target.value })}
              />
            </label>
            <label>
              No. Rangka
              <input
                value={form.noRangka}
                onChange={(e) => setForm({ ...form, noRangka: e.target.value })}
              />
            </label>
            <label>
              No. Mesin
              <input
                value={form.noMesin}
                onChange={(e) => setForm({ ...form, noMesin: e.target.value })}
              />
            </label>
            <label>
              Warna
              <input
                value={form.warna}
                onChange={(e) => setForm({ ...form, warna: e.target.value })}
              />
            </label>
            <label>
              Harga Beli (Rp)
              <input
                required
                type="number"
                min="0"
                value={form.hargaBeli}
                onChange={(e) => setForm({ ...form, hargaBeli: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              Keterangan
              <textarea
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
              />
            </label>
            <div className="form-actions form-grid-full">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
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
