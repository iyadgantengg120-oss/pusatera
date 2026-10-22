"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";

type Product = { id: string; kode: string; nama: string; harga_beli: number };
type Warehouse = { id: string; nama: string };
type Order = { id: string; nomor: string; supplier: string; total: number; status: string; tanggal: string };
type Baris = { productId: string; qty: string; harga: string };

const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
const barisKosong = (): Baris => ({ productId: "", qty: "", harga: "" });

const input =
  "w-full rounded-lg border border-[#1E4A5E] bg-[#081C27] px-3 py-2 text-sm text-white outline-none focus:border-[#2EC5E8]";

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplier, setSupplier] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [baris, setBaris] = useState<Baris[]>([barisKosong()]);
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const muat = useCallback(async () => {
    const res = await fetch("/api/purchase/receive");
    if (!res.ok) return;
    const d = await res.json();
    setProducts(d.products);
    setWarehouses(d.warehouses);
    setOrders(d.orders);
    setWarehouseId((w) => w || d.warehouses[0]?.id || "");
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const ubah = (idx: number, patch: Partial<Baris>) =>
    setBaris((b) => b.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const pilihProduk = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    ubah(idx, { productId, harga: p ? String(p.harga_beli) : "" });
  };

  const total = baris.reduce((a, b) => a + (Number(b.qty) || 0) * (Number(b.harga) || 0), 0);

  const terima = async () => {
    setMenyimpan(true);
    setPesan(null);
    const res = await fetch("/api/purchase/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier, warehouseId, items: baris }),
    });
    setMenyimpan(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPesan({ ok: false, teks: d.error || "Gagal" });
      return;
    }
    setPesan({ ok: true, teks: `Berhasil. ${d.nomor} tercatat, stok bertambah, jurnal dibuat.` });
    setSupplier("");
    setBaris([barisKosong()]);
    muat();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Pembelian</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">
        Terima barang: stok bertambah, kartu stok tercatat, jurnal otomatis (D Persediaan, K Hutang Usaha)
      </p>

      <div className="mb-8 rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[#9BB0BB]">Supplier *</label>
            <input className={input} value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#9BB0BB]">Gudang tujuan *</label>
            <select className={input} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {baris.map((b, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <select
                className={`${input} col-span-6`}
                value={b.productId}
                onChange={(e) => pilihProduk(idx, e.target.value)}
              >
                <option value="">Pilih produk...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kode} - {p.nama}
                  </option>
                ))}
              </select>
              <input
                className={`${input} col-span-2`}
                type="number"
                placeholder="Qty"
                value={b.qty}
                onChange={(e) => ubah(idx, { qty: e.target.value })}
              />
              <input
                className={`${input} col-span-3`}
                type="number"
                placeholder="Harga beli"
                value={b.harga}
                onChange={(e) => ubah(idx, { harga: e.target.value })}
              />
              <button
                onClick={() => setBaris((x) => (x.length > 1 ? x.filter((_, i) => i !== idx) : x))}
                className="col-span-1 flex items-center justify-center rounded text-[#9BB0BB] hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setBaris((b) => [...b, barisKosong()])}
          className="mt-3 flex items-center gap-1 text-sm text-[#2EC5E8] hover:underline"
        >
          <Plus size={14} /> Tambah barang
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E4A5E] pt-4">
          <div className="text-white">
            Total: <span className="text-xl font-extrabold text-[#2EC5E8]">{rupiah(total)}</span>
          </div>
          <button
            onClick={terima}
            disabled={menyimpan}
            className="rounded-lg bg-[#2596B5] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {menyimpan ? "Memproses..." : "Terima Barang"}
          </button>
        </div>

        {pesan && (
          <p className={`mt-3 text-sm ${pesan.ok ? "text-green-400" : "text-red-400"}`}>{pesan.teks}</p>
        )}
      </div>

      <h2 className="mb-3 text-lg font-bold text-white">Riwayat Pembelian</h2>
      <div className="overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1E4A5E] text-xs uppercase text-[#9BB0BB]">
            <tr>
              <th className="px-4 py-3">Nomor</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Belum ada pembelian.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-[#1E4A5E]/50">
                  <td className="px-4 py-3 font-mono text-xs text-[#2EC5E8]">{o.nomor}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">
                    {new Date(o.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">{o.supplier}</td>
                  <td className="px-4 py-3 text-right">{rupiah(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}