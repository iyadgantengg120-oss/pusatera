"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import { FileDown } from "lucide-react";

type Akun = { kode: string; nama: string; jumlah: number };
type Data = {
  pendapatan: Akun[];
  hpp: Akun[];
  beban: Akun[];
  totalPendapatan: number;
  totalHpp: number;
  totalBeban: number;
  labaKotor: number;
  laba: number;
  bulanan: { bulan: string; pendapatan: number; pengeluaran: number }[];
};

const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
const hariIni = () => new Date().toISOString().slice(0, 10);

const input =
  "rounded-lg border border-[#1E4A5E] bg-[#081C27] px-3 py-2 text-sm text-white outline-none focus:border-[#2EC5E8]";

export default function ProfitLossPage() {
  const [dari, setDari] = useState("2026-01-01");
  const [sampai, setSampai] = useState(hariIni());
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);

  const tampilkan = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/accounting/profit-loss?from=${dari}&to=${sampai}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [dari, sampai]);

  useEffect(() => {
    tampilkan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    let y = 20;
    const baris = (kiri: string, kanan: string, tebal = false) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", tebal ? "bold" : "normal");
      doc.text(kiri, 20, y);
      doc.text(kanan, 190, y, { align: "right" });
      y += 7;
    };

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN LABA RUGI", 105, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PUSATERA ERP", 105, y, { align: "center" });
    y += 6;
    doc.text(`Periode: ${dari} s/d ${sampai}`, 105, y, { align: "center" });
    y += 12;

    doc.setFontSize(11);
    baris("PENDAPATAN", "", true);
    data.pendapatan.forEach((a) => baris(`   ${a.kode}  ${a.nama}`, rupiah(a.jumlah)));
    baris("Total Pendapatan", rupiah(data.totalPendapatan), true);
    y += 3;

    baris("HARGA POKOK PENJUALAN", "", true);
    data.hpp.forEach((a) => baris(`   ${a.kode}  ${a.nama}`, rupiah(a.jumlah)));
    baris("Total HPP", rupiah(data.totalHpp), true);
    y += 3;

    baris("LABA KOTOR", rupiah(data.labaKotor), true);
    y += 3;

    baris("BEBAN OPERASIONAL", "", true);
    data.beban.forEach((a) => baris(`   ${a.kode}  ${a.nama}`, rupiah(a.jumlah)));
    baris("Total Beban", rupiah(data.totalBeban), true);
    y += 5;

    doc.setFontSize(13);
    baris(data.laba >= 0 ? "LABA BERSIH" : "RUGI BERSIH", rupiah(data.laba), true);

    doc.save(`laba-rugi_${dari}_${sampai}.pdf`);
  };

  const kartu = data
    ? [
        { l: "Pendapatan", v: data.totalPendapatan, w: "text-green-400" },
        { l: "HPP", v: data.totalHpp, w: "text-yellow-400" },
        { l: "Beban", v: data.totalBeban, w: "text-red-400" },
        { l: data.laba >= 0 ? "Laba Bersih" : "Rugi Bersih", v: data.laba, w: "text-[#2EC5E8]" },
      ]
    : [];

  const seksi = (judul: string, rows: Akun[], total: number, labelTotal: string) => (
    <>
      <tr className="bg-[#081C27]/60">
        <td colSpan={2} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2EC5E8]">
          {judul}
        </td>
      </tr>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={2} className="px-4 py-2 text-sm text-[#9BB0BB]">
            Tidak ada transaksi.
          </td>
        </tr>
      ) : (
        rows.map((a) => (
          <tr key={a.kode} className="border-b border-[#1E4A5E]/40">
            <td className="px-4 py-2 text-sm">
              <span className="mr-3 font-mono text-xs text-[#9BB0BB]">{a.kode}</span>
              {a.nama}
            </td>
            <td className="px-4 py-2 text-right text-sm">{rupiah(a.jumlah)}</td>
          </tr>
        ))
      )}
      <tr className="border-b border-[#1E4A5E]">
        <td className="px-4 py-2 text-sm font-bold">{labelTotal}</td>
        <td className="px-4 py-2 text-right text-sm font-bold">{rupiah(total)}</td>
      </tr>
    </>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Laporan Laba Rugi</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">Dihitung otomatis dari jurnal, sesuai rentang tanggal</p>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-[#9BB0BB]">Dari Tanggal</label>
          <input type="date" className={input} value={dari} onChange={(e) => setDari(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#9BB0BB]">Sampai</label>
          <input type="date" className={input} value={sampai} onChange={(e) => setSampai(e.target.value)} />
        </div>
        <button
          onClick={tampilkan}
          disabled={loading}
          className="rounded-lg bg-[#2596B5] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Memuat..." : "Tampilkan"}
        </button>
        <button
          onClick={exportPdf}
          disabled={!data}
          className="flex items-center gap-2 rounded-lg border border-[#2EC5E8] px-5 py-2 text-sm font-semibold text-[#2EC5E8] hover:bg-[#2EC5E8]/10 disabled:opacity-50"
        >
          <FileDown size={16} /> Export PDF
        </button>
      </div>

      {data && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {kartu.map((k) => (
              <div key={k.l} className="rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-4">
                <div className={`break-words text-xl font-extrabold ${k.w}`}>{rupiah(k.v)}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#9BB0BB]">{k.l}</div>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-4">
            <div className="mb-3 font-bold text-white">Pendapatan vs Pengeluaran per Bulan</div>
            {data.bulanan.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#9BB0BB]">Belum ada transaksi di rentang ini.</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.bulanan}>
                    <CartesianGrid stroke="#1E4A5E" strokeDasharray="3 3" />
                    <XAxis dataKey="bulan" stroke="#9BB0BB" />
                    <YAxis stroke="#9BB0BB" tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "jt"} />
                    <Tooltip
                      formatter={(v) => rupiah(Number(v))}
                      contentStyle={{ background: "#0E2A3A", border: "1px solid #1E4A5E" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#27C93F" strokeWidth={2} />
                    <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#FF5F56" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
            <table className="w-full text-left text-white">
              <tbody>
                {seksi("Pendapatan", data.pendapatan, data.totalPendapatan, "Total Pendapatan")}
                {seksi("Harga Pokok Penjualan", data.hpp, data.totalHpp, "Total HPP")}
                <tr className="border-b border-[#1E4A5E] bg-[#12384D]">
                  <td className="px-4 py-2 text-sm font-bold">Laba Kotor</td>
                  <td className="px-4 py-2 text-right text-sm font-bold">{rupiah(data.labaKotor)}</td>
                </tr>
                {seksi("Beban Operasional", data.beban, data.totalBeban, "Total Beban")}
                <tr className="bg-[#12384D]">
                  <td className="px-4 py-3 font-extrabold">{data.laba >= 0 ? "LABA BERSIH" : "RUGI BERSIH"}</td>
                  <td className={`px-4 py-3 text-right font-extrabold ${data.laba >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {rupiah(data.laba)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}