function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID').format(n);
}

module.exports = formatRupiah;
