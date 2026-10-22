"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Card = {
  id: string;
  tipe: string;
  qty: number;
  keterangan: string | null;
  createdAt: string;
  product: { kode: string; nama: string };
  warehouse: { nama: string };
};

export default function StockCardPage() {
  const [data, setData] = useState<Card[]>([]);
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/stock/card");
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, []);

  const tampil = data.filter((c) =>
    `${c.product.kode} ${c.product.nama} ${c.keterangan ?? ""}`
      .toLowerCase()
      .includes(cari.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Kartu Stok</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">Riwayat barang masuk dan keluar</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-[#9BB0BB]" />
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari produk atau keterangan..."
          className="w-full rounded-lg border border-[#1E4A5E] bg-[#0E2A3A] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#2EC5E8]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1E4A5E] text-xs uppercase text-[#9BB0BB]">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Gudang</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#9BB0BB]">Memuat...</td></tr>
            ) : tampil.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#9BB0BB]">Belum ada riwayat.</td></tr>
            ) : (
              tampil.map((c) => (
                <tr key={c.id} className="border-b border-[#1E4A5E]/50">
                  <td className="px-4 py-3 text-[#9BB0BB]">
                    {new Date(c.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-2 font-mono text-xs text-[#2EC5E8]">{c.product.kode}</span>
                    {c.product.nama}
                  </td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{c.warehouse.nama}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        c.tipe === "MASUK"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {c.tipe}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{c.qty}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{c.keterangan ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}