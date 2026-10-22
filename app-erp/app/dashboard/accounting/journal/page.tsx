"use client";

import { useEffect, useState } from "react";

type Detail = { id: string; debit: number; kredit: number; coa: { kode: string; nama: string } };
type Journal = { id: string; tanggal: string; keterangan: string; ref: string | null; details: Detail[] };

const rupiah = (n: number) => (n ? "Rp " + Math.round(n).toLocaleString("id-ID") : "-");

export default function JournalPage() {
  const [data, setData] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/accounting/journal");
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Jurnal Umum</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">
        Semua jurnal otomatis dari pembelian, penjualan, dan penggajian
      </p>

      {loading ? (
        <p className="text-[#9BB0BB]">Memuat...</p>
      ) : data.length === 0 ? (
        <p className="text-[#9BB0BB]">Belum ada jurnal.</p>
      ) : (
        <div className="space-y-4">
          {data.map((j) => (
            <div key={j.id} className="overflow-hidden rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E4A5E] px-4 py-3">
                <div className="font-semibold text-white">{j.keterangan}</div>
                <div className="text-xs text-[#9BB0BB]">
                  {new Date(j.tanggal).toLocaleDateString("id-ID")}
                  {j.ref && <span className="ml-3 font-mono text-[#2EC5E8]">{j.ref}</span>}
                </div>
              </div>
              <table className="w-full text-left text-sm text-white">
                <thead className="text-xs uppercase text-[#9BB0BB]">
                  <tr>
                    <th className="px-4 py-2">Akun</th>
                    <th className="px-4 py-2 text-right">Debit</th>
                    <th className="px-4 py-2 text-right">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {j.details.map((d) => (
                    <tr key={d.id} className="border-t border-[#1E4A5E]/40">
                      <td className={`px-4 py-2 ${d.kredit > 0 ? "pl-10" : ""}`}>
                        <span className="mr-2 font-mono text-xs text-[#9BB0BB]">{d.coa.kode}</span>
                        {d.coa.nama}
                      </td>
                      <td className="px-4 py-2 text-right">{rupiah(d.debit)}</td>
                      <td className="px-4 py-2 text-right">{rupiah(d.kredit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}