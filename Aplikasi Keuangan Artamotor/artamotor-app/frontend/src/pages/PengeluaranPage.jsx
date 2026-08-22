import { useEffect, useState } from 'react';
import { listPengeluaran, createPengeluaran, updatePengeluaran, deletePengeluaran } from '../api/pengeluaran';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import formatRupiah from '../utils/formatRupiah';

const KATEGORI_OPTIONS = [
  ['SEWA_TEMPAT', 'Sewa Tempat'],
  ['LISTRIK', 'Listrik'],
  ['GAJI_PEGAWAI', 'Gaji Pegawai'],
  ['IKLAN', 'Iklan'],
  ['PERAWATAN_SHOWROOM', 'Perawatan Showroom'],
  ['LAIN_LAIN', 'Lain-lain'],
];

const EMPTY_FORM = { tanggal: '', kategori: 'SEWA_TEMPAT', deskripsi: '', jumlah: '' };

function kategoriLabel(value) {
  return KATEGORI_OPTIONS.find(([k]) => k === value)?.[1] || value;
}

export default function PengeluaranPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await listPengeluaran({});
      setItems(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data pengeluaran');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setEditing('new');
  }

  function openEdit(item) {
    setForm({
      tanggal: item.tanggal.slice(0, 10),
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      jumlah: item.jumlah,
    });
    setFormError('');
    setEditing(item);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, jumlah: Number(form.jumlah) };
      if (editing === 'new') {
        await createPengeluaran(payload);
      } else {
        await updatePengeluaran(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan pengeluaran');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm('Hapus catatan pengeluaran ini?')) return;
    try {
      await deletePengeluaran(item.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pengeluaran');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Pengeluaran Operasional</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Tambah Pengeluaran
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kategori</th>
              <th>Deskripsi</th>
              <th>Jumlah</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                <td>{kategoriLabel(p.kategori)}</td>
                <td>{p.deskripsi}</td>
                <td>{formatRupiah(p.jumlah)}</td>
                <td className="table-actions">
                  <button type="button" className="btn-link" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  {user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      className="btn-link btn-link-danger"
                      onClick={() => handleDelete(p)}
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-row">
                  Belum ada data pengeluaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {meta && <p className="meta-info">Total {meta.total} pengeluaran</p>}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Tambah Pengeluaran' : 'Edit Pengeluaran'}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleSubmit} className="form-grid">
            {formError && <div className="alert alert-error form-grid-full">{formError}</div>}
            <label>
              Tanggal
              <input
                required
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </label>
            <label>
              Kategori
              <select
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              >
                {KATEGORI_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Jumlah (Rp)
              <input
                required
                type="number"
                min="0"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
              />
            </label>
            <label className="form-grid-full">
              Deskripsi
              <input
                required
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
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
