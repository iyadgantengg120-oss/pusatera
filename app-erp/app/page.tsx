"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import type { ReactNode } from "react";

const CYAN = "#2EC5E8";

function Logo() {
  return (
    <div className="flex items-center text-2xl font-extrabold tracking-tight">
      <span style={{ color: "#2A7CB7" }}>MO</span>
      <svg width="22" height="22" viewBox="0 0 24 24" className="mx-[1px]" fill="none">
        <path d="M3 4l9 16 9-16" stroke="#F89C1D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 14V2M7 7l5-5 5 5" stroke="#F89C1D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: "#F89C1D" }}>ERA</span>
    </div>
  );
}

function Judul({ teks }: { teks: string }) {
  const kata = teks.split(" ");
  const akhir = kata.pop();
  return (
    <h2 className="text-4xl font-extrabold leading-tight text-white md:text-[52px]">
      {kata.join(" ")} <span style={{ color: CYAN }}>{akhir}</span>
    </h2>
  );
}

function Browser({ children }: { children: ReactNode }) {
  return (
    <div className="w-full" style={{ perspective: "1000px" }}>
      <div
        className="overflow-hidden "
        style={{
          background: "#0E2A3A",
          border: "1px solid #1E4A5E",
          borderRadius: 12,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center gap-2 border-b border-[#1E4A5E] px-4 py-3">
          <span className="h-3 w-3 rounded-full" style={{ background: "#FF5F56" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#FFBD2E" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#27C93F" }} />
        </div>
        <div className="p-4 text-white">{children}</div>
      </div>
    </div>
  );
}

function Section({
  id, label, judul, desc, children, extra,
}: {
  id?: string; label: string; judul: string; desc: string; children: ReactNode; extra?: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="grid items-center gap-12 lg:grid-cols-2"
      >
        <div className="max-w-[500px]">
          <div className="mb-4 text-[14px] font-bold uppercase" style={{ color: CYAN, letterSpacing: "3px" }}>
            {label}
          </div>
          <Judul teks={judul} />
          <p className="mt-5 text-[18px]" style={{ color: "#9BB0BB" }}>{desc}</p>
          {extra}
        </div>
        <Browser>{children}</Browser>
      </motion.div>
    </section>
  );
}

const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

function Kartu({ nilai, label, warna = "text-white" }: { nilai: string; label: string; warna?: string }) {
  return (
    <div className="rounded-lg border border-[#1E4A5E] bg-[#081C27] p-3">
      <div className={`text-lg font-extrabold ${warna}`}>{nilai}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[#9BB0BB]">{label}</div>
    </div>
  );
}

const trend = [
  { b: "Mar", p: 42, k: 30 },
  { b: "Apr", p: 55, k: 31 },
  { b: "Mei", p: 61, k: 30 },
  { b: "Jun", p: 78, k: 32 },
  { b: "Jul", p: 92, k: 31 },
  { b: "Agu", p: 118, k: 32 },
];
const donut = [
  { n: "Selesai", v: 62, c: "#27C93F" },
  { n: "Proses", v: 24, c: CYAN },
  { n: "Batal", v: 14, c: "#FF5F56" },
];

export default function LandingPage() {
  const pills = ["Penjualan", "Pembelian", "Stok Gudang", "Akuntansi", "Kas & Bank", "HRD & Gaji", "POS Kasir", "Laporan"];

  return (
    <main
      className="min-h-screen overflow-x-hidden text-white"
      style={{
        background: "#081C27",
        backgroundImage: "radial-gradient(circle at 90% 10%, #0F3A4D 0%, transparent 60%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-[#1E4A5E]/50 backdrop-blur" style={{ background: "rgba(8,28,39,0.8)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="hidden items-center gap-8 text-sm font-semibold text-[#9BB0BB] md:flex">
            <a href="#fitur" className="hover:text-white">Fitur</a>
            <a href="#harga" className="hover:text-white">Harga</a>
            <a href="#testimoni" className="hover:text-white">Testimoni</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Masuk</Link>
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "#2596B5" }}>
              Demo Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <div className="max-w-[500px]">
            <div className="mb-4 text-[14px] font-bold uppercase" style={{ color: CYAN, letterSpacing: "3px" }}>
              PUSATERA
            </div>
            <h1 className="text-5xl font-extrabold leading-tight md:text-[56px]">
              Satu Sistem, Seluruh Bisnis <span style={{ color: CYAN }}>Terkendali</span>
            </h1>
            <p className="mt-5 text-[18px]" style={{ color: "#9BB0BB" }}>
              ERP lengkap untuk bisnis Indonesia — jual-beli, stok, kasir, gaji karyawan, sampai laporan keuangan otomatis.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {pills.map((p) => (
                <span key={p} className="rounded-full border border-[#1E4A5E] bg-[#0E2A3A] px-3 py-1 text-sm text-[#9BB0BB]">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <Browser>
            <div className="mb-3 text-sm font-bold">Selamat Pagi, <span style={{ color: CYAN }}>Administrator</span></div>
            <div className="grid grid-cols-2 gap-2">
              <Kartu nilai="24" label="Total Produk" />
              <Kartu nilai="1" label="Total Gudang" />
              <Kartu nilai="23" label="Stok Normal" warna="text-green-400" />
              <Kartu nilai="1" label="Stok Minimum" warna="text-yellow-400" />
            </div>
          </Browser>
        </motion.div>
      </section>

      {/* AKUNTANSI */}
      <Section
        id="fitur"
        label="AKUNTANSI OTOMATIS"
        judul="Laporan Keuangan? Otomatis."
        desc="Laba Rugi & Neraca tersusun sendiri dari setiap transaksi. Pilih tanggal, export PDF — selesai."
      >
        <div className="mb-3 flex flex-wrap items-end gap-2 text-[10px] text-[#9BB0BB]">
          <div>Dari Tanggal<div className="mt-1 rounded border border-[#1E4A5E] bg-[#081C27] px-2 py-1 text-white">2026-01-01</div></div>
          <div>Sampai<div className="mt-1 rounded border border-[#1E4A5E] bg-[#081C27] px-2 py-1 text-white">2026-08-18</div></div>
          <span className="rounded px-3 py-1.5 font-semibold text-white" style={{ background: "#2596B5" }}>Tampilkan</span>
          <span className="rounded border px-3 py-1.5 font-semibold" style={{ borderColor: CYAN, color: CYAN }}>Export PDF</span>
        </div>
        <table className="w-full text-xs">
          <tbody>
            {[
              ["Pendapatan Penjualan", 486500000, ""],
              ["Harga Pokok Penjualan", 301200000, ""],
              ["Laba Kotor", 185300000, "font-bold"],
              ["Beban Gaji", 62500000, ""],
              ["Beban Operasional", 24800000, ""],
              ["Laba Bersih", 98000000, "font-extrabold text-green-400"],
            ].map(([n, v, c]) => (
              <tr key={n as string} className={`border-b border-[#1E4A5E]/50 ${c}`}>
                <td className="py-2">{n}</td>
                <td className="py-2 text-right">{rp(v as number)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ANALISIS */}
      <Section
        label="ANALISIS"
        judul="Untung-Rugi Terpantau Tiap Bulan"
        desc="Tren pendapatan vs pengeluaran tampil sebagai grafik — keputusan bisnis tak lagi menebak."
      >
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid stroke="#1E4A5E" strokeDasharray="3 3" />
                <XAxis dataKey="b" stroke="#9BB0BB" fontSize={10} />
                <YAxis stroke="#9BB0BB" fontSize={10} />
                <Line dataKey="p" stroke="#27C93F" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="k" stroke="#FF5F56" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="col-span-2 h-44">
            <div className="text-center text-[10px] text-[#9BB0BB]">Order Summary</div>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={donut} dataKey="v" innerRadius={30} outerRadius={50} stroke="none" isAnimationActive={false}>
                  {donut.map((d) => <Cell key={d.n} fill={d.c} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[10px] text-[#9BB0BB]">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#27C93F]" />Pendapatan</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#FF5F56]" />Pengeluaran</span>
        </div>
      </Section>

      {/* PERSEDIAAN */}
      <Section
        label="PERSEDIAAN"
        judul="Stok Semua Gudang, Real-Time"
        desc="Lengkap dengan nilai stok, kartu stok, dan peringatan stok minimum — tanpa hitung manual."
      >
        <div className="mb-3 grid grid-cols-3 gap-2">
          <Kartu nilai="24" label="Total Produk" />
          <Kartu nilai="1" label="Total Gudang" />
          <Kartu nilai="23" label="Stok Normal" warna="text-green-400" />
          <Kartu nilai="1" label="Stok Minimum" warna="text-yellow-400" />
          <Kartu nilai="0" label="Stok Habis" warna="text-red-400" />
          <Kartu nilai="Rp 2.461.060.000" label="Nilai" warna="text-[#2EC5E8]" />
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-[8px]">
            <thead className="text-[#9BB0BB]">
              <tr className="border-b border-[#1E4A5E]">
                {["KODE", "NAMA", "BARCODE", "KATEGORI", "SATUAN", "GUDANG", "LOKASI", "QTY ON HAND", "HARGA UNIT", "STOK NILAI"].map((h) => (
                  <th key={h} className="px-1 py-1 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["PRD-ATK-001", "Kertas A4 80gsm", "899001", "ATK", "Rim", "Gudang Utama", "Jakarta", "120", "45.000", "5.400.000"],
                ["PRD-ATK-003", "Binder Clip 32mm", "899003", "ATK", "Box", "Gudang Utama", "Jakarta", "8", "12.000", "96.000"],
                ["PRD-ELK-001", "Laptop Asus X335", "899101", "Elektronik", "Unit", "Gudang Utama", "Jakarta", "15", "8.500.000", "127.500.000"],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-[#1E4A5E]/50">
                  {r.map((c, i) => <td key={i} className="truncate px-1 py-1.5">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* POS */}
      <Section
        label="POS KASIR"
        judul="Kasir Modern untuk Toko & Resto"
        desc="Tunai, transfer, QRIS — setiap struk langsung memotong stok dan tercatat di pembukuan."
      >
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3 grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded border border-[#1E4A5E] bg-[#081C27] p-2">
                <div className="mb-1 h-6 rounded bg-[#12384D]" />
                <div className="text-[9px] text-white">Produk {i + 1}</div>
                <div className="text-[9px]" style={{ color: CYAN }}>{rp((i + 1) * 15000)}</div>
              </div>
            ))}
          </div>
          <div className="col-span-2 rounded border border-[#1E4A5E] bg-[#081C27] p-2 text-[10px]">
            <div className="mb-2 font-bold">Keranjang</div>
            <div className="flex justify-between text-[#9BB0BB]"><span>Produk 1 x2</span><span>{rp(30000)}</span></div>
            <div className="flex justify-between text-[#9BB0BB]"><span>Produk 4 x1</span><span>{rp(60000)}</span></div>
            <div className="mt-2 flex justify-between border-t border-[#1E4A5E] pt-2 font-bold">
              <span>Total</span><span style={{ color: CYAN }}>{rp(90000)}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {["Tunai", "Transfer", "QRIS"].map((m) => (
                <span key={m} className="rounded border border-[#1E4A5E] py-1 text-center text-[8px] text-[#9BB0BB]">{m}</span>
              ))}
            </div>
            <div className="mt-2 rounded py-1.5 text-center font-semibold" style={{ background: "#2596B5" }}>Bayar</div>
          </div>
        </div>
      </Section>

      {/* DASHBOARD */}
      <Section
        label="DASHBOARD"
        judul="Semua Bisnis, Satu Layar"
        desc="Penjualan, kas, stok, dan piutang — kondisi bisnis terlihat begitu Anda login."
      >
        <div className="text-sm font-bold">Selamat Pagi, <span style={{ color: CYAN }}>Administrator</span></div>
        <div className="mb-3 text-[10px] text-[#9BB0BB]">Minggu, 16 Agustus 2025</div>
        <div className="grid grid-cols-2 gap-2">
          <Kartu nilai="24" label="Total Produk" />
          <Kartu nilai="4" label="Total Gudang" />
          <Kartu nilai="11" label="Total Mitra" />
          <Kartu nilai="1" label="Total User" />
        </div>
        <div className="mt-3 text-[10px] font-bold">Aksi Cepat</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Tambah Produk", "Stok On Hand", "Kasir POS", "Pembelian", "Penjualan", "Laba Rugi"].map((a) => (
            <span key={a} className="rounded px-2 py-1 text-[9px] font-semibold" style={{ background: "#2596B5" }}>{a}</span>
          ))}
        </div>
      </Section>

      {/* HRD */}
      <Section
        label="HRD & PENGGAJIAN"
        judul="Urusan Karyawan Ikut Beres"
        desc="Absensi GPS, cuti & izin, sampai slip gaji otomatis — satu sistem dengan keuangan Anda."
      >
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] text-[#9BB0BB]">
            <tr className="border-b border-[#1E4A5E]">
              {["NAMA", "JABATAN", "DEPARTEMEN", "STATUS", "TELEPON"].map((h) => <th key={h} className="py-2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[
              ["Andi Wijaya", "Sales", "Penjualan"],
              ["Budi Santoso", "Manager", "Operasional"],
              ["Dewi Lestari", "Kepala Gudang", "Gudang"],
              ["Siti Aminah", "Finance", "Keuangan"],
              ["Joko Susanto", "Staff Gudang", "Gudang"],
            ].map(([n, j, d], i) => (
              <tr key={n} className="border-b border-[#1E4A5E]/50">
                <td className="py-2">{n}</td>
                <td className="py-2 text-[#9BB0BB]">{j}</td>
                <td className="py-2 text-[#9BB0BB]">{d}</td>
                <td className="py-2"><span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-bold text-green-400">AKTIF</span></td>
                <td className="py-2 text-[#9BB0BB]">0812-0000-00{i}{i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <footer className="border-t border-[#1E4A5E]/50 py-8 text-center text-sm text-[#9BB0BB]">
        © 2026 MOVERA — PUSATERA, Pusat Kendali Bisnis Anda
      </footer>

      {/* TOMBOL FIXED */}
      <Link
        href="/login"
        className="fixed bottom-6 right-6 z-50 rounded-lg px-6 py-3 font-semibold text-white shadow-lg hover:opacity-90"
        style={{ background: "#2596B5" }}
      >
        DEMO GRATIS →
      </Link>
    </main>
  );
}