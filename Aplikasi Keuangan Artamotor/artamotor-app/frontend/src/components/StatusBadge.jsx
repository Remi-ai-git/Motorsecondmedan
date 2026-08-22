const STATUS_MAP = {
  TERSEDIA: { label: 'Tersedia', className: 'badge badge-green' },
  TERJUAL: { label: 'Terjual', className: 'badge badge-gray' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, className: 'badge' };
  return <span className={cfg.className}>{cfg.label}</span>;
}
