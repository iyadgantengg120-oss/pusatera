"use client";

import { useEffect, useState, useCallback } from "react";

type Employee = {
  id: string;
  nama: string;
  jabatan: string;
  departemen: string;
  status: string;
  telepon: string | null;
  gaji: number;
};
type Payroll = {
  id: string;
  employeeId: string;
  periode: string;
  jumlah: number;
  tanggal: string;
  employee: { nama: string };
};

const rupiah = (n: number) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");
const bulanIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [periode, setPeriode] = useState(bulanIni());
  const [pilih, setPilih] = useState<Set<string>>(new Set());
  const [gajiEdit, setGajiEdit] = useState<Record<string, string>>({});
  const [pesan, setPesan] = useState<{ ok: boolean; teks: string } | null>(null);
  const [proses, setProses] = useState(false);

  const muat = useCallback(async () => {
    const res = await fetch("/api/payroll/pay");
    if (!res.ok) return;
    const d = await res.json();
    setEmployees(d.employees);
    setPayrolls(d.payrolls);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const sudahDibayar = new Set(
    payrolls.filter((p) => p.periode === periode).map((p) => p.employeeId)
  );

  const simpanGaji = async (e: Employee) => {
    const nilai = gajiEdit[e.id];
    if (nilai === undefined || Number(nilai) === e.gaji) return;
    await fetch("/api/payroll/pay", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: e.id, gaji: Number(nilai) }),
    });
    muat();
  };

  const toggle = (id: string) =>
    setPilih((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bisaDibayar = employees.filter((e) => !sudahDibayar.has(e.id) && e.gaji > 0);
  const pilihSemua = () => setPilih(new Set(bisaDibayar.map((e) => e.id)));

  const totalPilih = employees
    .filter((e) => pilih.has(e.id) && !sudahDibayar.has(e.id))
    .reduce((a, e) => a + e.gaji, 0);

  const bayar = async () => {
    setProses(true);
    setPesan(null);
    const res = await fetch("/api/payroll/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periode, employeeIds: [...pilih] }),
    });
    setProses(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setPesan({ ok: false, teks: d.error || "Gagal" });
      return;
    }
    setPesan({
      ok: true,
      teks: `Berhasil. ${d.jumlah} karyawan dibayar, total ${rupiah(d.total)}. Jurnal dibuat.`,
    });
    setPilih(new Set());
    muat();
  };

  const input =
    "rounded-lg border border-[#1E4A5E] bg-[#081C27] px-3 py-2 text-sm text-white outline-none focus:border-[#2EC5E8]";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold text-white">Penggajian</h1>
      <p className="mb-6 text-sm text-[#9BB0BB]">
        Bayar gaji karyawan, jurnal otomatis (D Beban Gaji, K Kas)
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-[#9BB0BB]">Periode</label>
          <input
            type="month"
            className={input}
            value={periode}
            onChange={(e) => {
              setPeriode(e.target.value);
              setPilih(new Set());
            }}
          />
        </div>
        <button
          onClick={pilihSemua}
          className="rounded-lg border border-[#1E4A5E] px-4 py-2 text-sm text-[#9BB0BB] hover:text-white"
        >
          Pilih semua yang belum dibayar
        </button>
      </div>

      <div className="mb-6 overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1E4A5E] text-xs uppercase text-[#9BB0BB]">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Departemen</th>
              <th className="px-4 py-3">Gaji (bisa diedit)</th>
              <th className="px-4 py-3">Status {periode}</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {employees.map((e) => {
              const lunas = sudahDibayar.has(e.id);
              return (
                <tr key={e.id} className="border-b border-[#1E4A5E]/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      disabled={lunas || e.gaji <= 0}
                      checked={pilih.has(e.id)}
                      onChange={() => toggle(e.id)}
                    />
                  </td>
                  <td className="px-4 py-3">{e.nama}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{e.jabatan}</td>
                  <td className="px-4 py-3 text-[#9BB0BB]">{e.departemen}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className={`${input} w-40`}
                      value={gajiEdit[e.id] ?? String(e.gaji)}
                      onChange={(ev) => setGajiEdit({ ...gajiEdit, [e.id]: ev.target.value })}
                      onBlur={() => simpanGaji(e)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {lunas ? (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-bold text-green-400">
                        SUDAH DIBAYAR
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-xs font-bold text-yellow-400">
                        BELUM
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E4A5E] bg-[#0E2A3A] p-4">
        <div className="text-white">
          Total dibayar:{" "}
          <span className="text-xl font-extrabold text-[#2EC5E8]">{rupiah(totalPilih)}</span>
        </div>
        <button
          onClick={bayar}
          disabled={proses || pilih.size === 0}
          className="rounded-lg bg-[#2596B5] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {proses ? "Memproses..." : "Bayar Gaji"}
        </button>
        {pesan && (
          <p className={`w-full text-sm ${pesan.ok ? "text-green-400" : "text-red-400"}`}>{pesan.teks}</p>
        )}
      </div>

      <h2 className="mb-3 text-lg font-bold text-white">Riwayat Pembayaran</h2>
      <div className="overflow-x-auto rounded-xl border border-[#1E4A5E] bg-[#0E2A3A]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1E4A5E] text-xs uppercase text-[#9BB0BB]">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Periode</th>
              <th className="px-4 py-3">Karyawan</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#9BB0BB]">
                  Belum ada pembayaran gaji.
                </td>
              </tr>
            ) : (
              payrolls.map((p) => (
                <tr key={p.id} className="border-b border-[#1E4A5E]/50">
                  <td className="px-4 py-3 text-[#9BB0BB]">
                    {new Date(p.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#2EC5E8]">{p.periode}</td>
                  <td className="px-4 py-3">{p.employee.nama}</td>
                  <td className="px-4 py-3 text-right">{rupiah(p.jumlah)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}