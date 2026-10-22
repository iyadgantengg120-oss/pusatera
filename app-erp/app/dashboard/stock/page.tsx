"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Row = {
  key: string;
  kode: string;
  nama: string;
  barcode: string | null;
  kategori: string;
  satuan: string;
  gudang: string;
  lokasi: string;
  qty: number;
  harga_unit: number;
  nilai: number;
  status: "NORMAL" | "MINIMUM" | "HABIS";
};

type Ringkasan = {
  totalProduk: number;
  totalGudang: number;
  normal: number;
  minimum: number;
  habis: number;
  nilai: number;
};

const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function StockPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ring, setRing] = useState<Ringkasan | null>(null);
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/stock");
      if (res.ok) {
        const d = await res.json();
        setRows(d.rows);
        setRing(d.ringkasan);
      }
      setLoading(false);
    })();
  }, []);

  const tampil = rows.filter((r) =>
    `${r.kode} ${r.nama} ${r.barcode ?? ""} ${r.kategori} ${r.gudang}`
      .toLowerCase()
      .includes(cari.toLowerCase())
  );

  const kartu = ring
    ? [
        { label: "Total Produk", nilai: String(ring.totalProduk), warna: "text-white" },
        { label: "Total Gudang", nilai: String(ring.totalGudang), warna: "text-white" },
        { label: "Stok Normal", nilai: String(ring.normal), warna: "text-green-400" },
        { label: "Stok Minimum", nilai: String(ring.minimum), warna: "text-yellow-400" },
        { label: "Stok Habis", nilai: String(ring.habis), warna: "text-red-400" },
        { label: "Nilai Stok", nilai: rupiah(ring.nilai), warna: "text-[#2EC5E8]", kecil: true },
      ]
    : [];

  const badge = (s: Row["status"]) => {
    if (s === "MINIMUM")
      return (
        <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-bold text-yellow-400">
          STOK MINIMUM
        </span>
      );
    if (s === "HABIS")
      return (
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
          HABIS
        </span>
      );
    return (
      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
        NORMAL
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Stok On Hand</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">Posisi stok semua gudang, real-time dari database</p>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kartu.map((k) => (
          <div key={k.label} className="rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-4">
            <div className={`break-words font-extrabold ${k.kecil ? "text-lg" : "text-3xl"} ${k.warna}`}>
              {k.nilai}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#9BB0BB]">
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-[#9BB0BB]" />
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari kode, nama, gudang..."
          className="w-full rounded-lg border border-[#1E4A5E] bg-[#0E2A3A] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[#2EC5E8]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1E4A5E] text-xs uppercase text-[#9BB0BB]">
            <tr>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Satuan</th>
              <th className="px-4 py-3">Gudang</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3 text-right">Qty On Hand</th>
              <th className="px-4 py-3 text-right">Harga Unit</th>
              <th className="px-4 py-3 text-right">Stok Nilai</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Memuat...
                </td>
              </tr>
            ) : tampil.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              tampil.map((r) => (
                <tr key={r.key} className="border-b border-[#1E4A5E]/50 hover:bg-[#12384D]">
                  <td className="px-4 py-3 font-mono text-xs text-[#2EC5E8]">{r.kode}</td>
                  <td className="px-4 py-3">{r.nama}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{r.kategori}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{r.satuan}</td>
                  <td className="px-4 py-3">{r.gudang}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{r.lokasi}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.qty}</td>
                  <td className="px-4 py-3 text-right">{rupiah(r.harga_unit)}</td>
                  <td className="px-4 py-3 text-right">{rupiah(r.nilai)}</td>
                  <td className="px-4 py-3">{badge(r.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}