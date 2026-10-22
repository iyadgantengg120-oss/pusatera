export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-4">DASHBOARD PUSATERA AKTIF! 🔥</h1>
      <p className="text-white/70 mb-6">Bypass berhasil Yad - ga perlu login lagi!</p>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-white/60">Total Produk</p>
          <p className="text-2xl font-bold text-white">1,234</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-white/60">Pesanan Hari Ini</p>
          <p className="text-2xl font-bold text-white">56</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl">
          <p className="text-white/60">Pendapatan</p>
          <p className="text-2xl font-bold text-white">Rp 12jt</p>
        </div>
      </div>
    </div>
  )
}
