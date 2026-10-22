"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

type Product = {
  id: string;
  kode: string;
  nama: string;
  barcode: string | null;
  kategori: string;
  satuan: string;
  harga_beli: number;
  harga_jual: number;
  stok_minimum: number;
};

const kosong = {
  kode: "",
  nama: "",
  barcode: "",
  kategori: "",
  satuan: "Pcs",
  harga_beli: "",
  harga_jual: "",
  stok_minimum: "",
};

const rupiah = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(true);
  const [buka, setBuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>(kosong);
  const [error, setError] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const muat = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const tambah = () => {
    setEditId(null);
    setForm(kosong);
    setError("");
    setBuka(true);
  };

  const ubah = (p: Product) => {
    setEditId(p.id);
    setForm({
      kode: p.kode,
      nama: p.nama,
      barcode: p.barcode ?? "",
      kategori: p.kategori,
      satuan: p.satuan,
      harga_beli: String(p.harga_beli),
      harga_jual: String(p.harga_jual),
      stok_minimum: String(p.stok_minimum),
    });
    setError("");
    setBuka(true);
  };

  const simpan = async () => {
    setMenyimpan(true);
    setError("");
    const res = await fetch("/api/products", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { ...form, id: editId } : form),
    });
    setMenyimpan(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Gagal menyimpan");
      return;
    }
    setBuka(false);
    muat();
  };

  const hapus = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.nama}"? Data stok dan kartu stoknya ikut terhapus.`)) return;
    await fetch(`/api/products?id=${p.id}`, { method: "DELETE" });
    muat();
  };

  const tampil = items.filter((p) =>
    `${p.kode} ${p.nama} ${p.barcode ?? ""} ${p.kategori}`
      .toLowerCase()
      .includes(cari.toLowerCase())
  );

  const field = (key: string, label: string, type = "text") => (
    <div>
      <label className="mb-1 block text-xs text-[#9BB0BB]">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-lg border border-[#1E4A5E] bg-[#081C27] px-3 py-2 text-sm text-white outline-none focus:border-[#2EC5E8]"
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Produk</h1>
          <p className="text-sm text-[#9BB0BB]">{items.length} produk terdaftar</p>
        </div>
        <button
          onClick={tambah}
          className="flex items-center gap-2 rounded-lg bg-[#2596B5] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-2.5 text-[#9BB0BB]" />
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari kode, nama, barcode..."
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
              <th className="px-4 py-3 text-right">Harga Beli</th>
              <th className="px-4 py-3 text-right">Harga Jual</th>
              <th className="px-4 py-3 text-right">Min</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Memuat...
                </td>
              </tr>
            ) : tampil.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              tampil.map((p) => (
                <tr key={p.id} className="border-b border-[#1E4A5E]/50 hover:bg-[#12384D]">
                  <td className="px-4 py-3 font-mono text-xs text-[#2EC5E8]">{p.kode}</td>
                  <td className="px-4 py-3">{p.nama}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{p.kategori}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{p.satuan}</td>
                  <td className="px-4 py-3 text-right">{rupiah(p.harga_beli)}</td>
                  <td className="px-4 py-3 text-right">{rupiah(p.harga_jual)}</td>
                  <td className="px-4 py-3 text-right">{p.stok_minimum}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => ubah(p)}
                        className="rounded p-1.5 text-[#9BB0BB] hover:bg-[#1E4A5E] hover:text-white"
                        title="Ubah"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => hapus(p)}
                        className="rounded p-1.5 text-[#9BB0BB] hover:bg-red-500/20 hover:text-red-400"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {buka && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editId ? "Ubah Produk" : "Tambah Produk"}
              </h2>
              <button onClick={() => setBuka(false)} className="text-[#9BB0BB] hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field("kode", "Kode *")}
              {field("nama", "Nama *")}
              {field("barcode", "Barcode")}
              {field("kategori", "Kategori")}
              {field("satuan", "Satuan")}
              {field("stok_minimum", "Stok Minimum", "number")}
              {field("harga_beli", "Harga Beli", "number")}
              {field("harga_jual", "Harga Jual", "number")}
            </div>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setBuka(false)}
                className="rounded-lg border border-[#1E4A5E] px-4 py-2 text-sm text-[#9BB0BB] hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={simpan}
                disabled={menyimpan}
                className="rounded-lg bg-[#2596B5] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {menyimpan ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}