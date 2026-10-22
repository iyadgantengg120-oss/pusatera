"use client";

import { useEffect, useState, useCallback } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

type Product = { id: string; kode: string; nama: string; harga_jual: number; stok: number };
type Cart = Record<string, number>;

const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
const METODE = [
  { k: "TUNAI", l: "Tunai" },
  { k: "TRANSFER", l: "Transfer" },
  { k: "QRIS", l: "QRIS" },
];

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [metode, setMetode] = useState("TUNAI");
  const [cari, setCari] = useState("");
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [proses, setProses] = useState(false);

  const muat = useCallback(async () => {
    const res = await fetch("/api/sales/create");
    if (!res.ok) return;
    const d = await res.json();
    setProducts(d.products);
    setWarehouseId((w) => w || d.warehouses[0]?.id || "");
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const tambah = (p: Product) =>
    setCart((c) => ((c[p.id] ?? 0) < p.stok ? { ...c, [p.id]: (c[p.id] ?? 0) + 1 } : c));

  const kurang = (id: string) =>
    setCart((c) => {
      const n = { ...c };
      if ((n[id] ?? 0) <= 1) delete n[id];
      else n[id] -= 1;
      return n;
    });

  const isi = products.filter((p) => cart[p.id]);
  const total = isi.reduce((a, p) => a + p.harga_jual * cart[p.id], 0);

  const bayar = async () => {
    setProses(true);
    setPesan(null);
    const res = await fetch("/api/pos/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metode,
        warehouseId,
        items: isi.map((p) => ({ productId: p.id, qty: cart[p.id], harga: p.harga_jual })),
      }),
    });
    setProses(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPesan({ ok: false, teks: d.error || "Gagal" });
      return;
    }
    setPesan({ ok: true, teks: `Lunas. Struk ${d.nomor}` });
    setCart({});
    muat();
  };

  const tampil = products.filter((p) =>
    `${p.kode} ${p.nama}`.toLowerCase().includes(cari.toLowerCase())
  );

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-2xl font-extrabold text-white">POS Kasir</h1>
        <input
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari produk..."
          className="my-4 w-full max-w-sm rounded-lg border border-[#1E4A5E] bg-[#0E2A3A] px-3 py-2 text-sm text-white outline-none focus:border-[#2EC5E8]"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {tampil.map((p) => (
            <button
              key={p.id}
              onClick={() => tambah(p)}
              disabled={p.stok <= 0}
              className="rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-3 text-left hover:border-[#2EC5E8] disabled:opacity-40"
            >
              <div className="font-mono text-[10px] text-[#2EC5E8]">{p.kode}</div>
              <div className="mt-1 text-sm font-semibold text-white">{p.nama}</div>
              <div className="mt-2 text-sm text-[#2EC5E8]">{rupiah(p.harga_jual)}</div>
              <div className="text-xs text-[#9BB0BB]">Stok {p.stok}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-fit rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-4">
        <div className="mb-3 flex items-center gap-2 font-bold text-white">
          <ShoppingCart size={18} /> Keranjang
        </div>

        {isi.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#9BB0BB]">Klik produk untuk menambah.</p>
        ) : (
          <div className="space-y-3">
            {isi.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 text-sm text-white">
                <div className="min-w-0 flex-1">
                  <div className="truncate">{p.nama}</div>
                  <div className="text-xs text-[#9BB0BB]">{rupiah(p.harga_jual)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => kurang(p.id)} className="rounded bg-[#1E4A5E] p-1">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center">{cart[p.id]}</span>
                  <button onClick={() => tambah(p)} className="rounded bg-[#1E4A5E] p-1">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#1E4A5E] pt-4 text-white">
          <span>Total</span>
          <span className="text-xl font-extrabold text-[#2EC5E8]">{rupiah(total)}</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {METODE.map((m) => (
            <button
              key={m.k}
              onClick={() => setMetode(m.k)}
              className={`rounded-lg border px-2 py-2 text-sm ${
                metode === m.k
                  ? "border-[#2EC5E8] bg-[#2EC5E8]/20 text-white"
                  : "border-[#1E4A5E] text-[#9BB0BB]"
              }`}
            >
              {m.l}
            </button>
          ))}
        </div>

        <button
          onClick={bayar}
          disabled={proses || isi.length === 0}
          className="mt-4 w-full rounded-lg bg-[#2596B5] py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {proses ? "Memproses..." : "Bayar"}
        </button>

        {pesan && (
          <p className={`mt-3 text-sm ${pesan.ok ? "text-green-400" : "text-red-400"}`}>{pesan.teks}</p>
        )}
      </div>
    </div>
  );
}