"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  User,
  Globe,
  Database,
  UserPlus,
  Users,
  Banknote,
  Boxes,
  Package,
  Factory,
  ShoppingCart,
  Store,
  TrendingUp,
  Wallet,
  Calculator,
  Contact,
  FileText,
  Wrench,
  ChevronDown,
  LogOut,
} from "lucide-react";

type Child = { label: string; href: string };
type Item = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: Child[];
};

const menu: Item[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Portal Karyawan", icon: User, href: "/dashboard/portal" },
  { label: "Landing Page", icon: Globe, href: "/" },
  { label: "Master Data", icon: Database, href: "/dashboard/master" },
  { label: "Rekrutmen", icon: UserPlus, href: "/dashboard/recruitment" },
  { label: "HRD / SDM", icon: Users, href: "/dashboard/hrd" },
  { label: "Penggajian", icon: Banknote, href: "/dashboard/payroll" },
  {
    label: "Persediaan",
    icon: Boxes,
    children: [
      { label: "Stok On Hand", href: "/dashboard/stock" },
      { label: "Penyesuaian Stok", href: "/dashboard/stock/adjust" },
      { label: "Laporan Stok", href: "/dashboard/stock/report" },
      { label: "Transfer Gudang", href: "/dashboard/stock/transfer" },
      { label: "Kartu Stok", href: "/dashboard/stock/card" },
    ],
  },
  { label: "Produk", icon: Package, href: "/dashboard/products" },
  { label: "Produksi", icon: Factory, href: "/dashboard/production" },
  { label: "Pembelian", icon: ShoppingCart, href: "/dashboard/purchase" },
  { label: "Penjualan", icon: TrendingUp, href: "/dashboard/sales" },
  { label: "POS Kasir", icon: Store, href: "/dashboard/pos" },
  { label: "Keuangan & Kas", icon: Wallet, href: "/dashboard/finance" },
  {
    label: "Akuntansi",
    icon: Calculator,
    children: [
      { label: "Jurnal Umum", href: "/dashboard/accounting/journal" },
      { label: "Buku Besar", href: "/dashboard/accounting/ledger" },
      { label: "Neraca Saldo", href: "/dashboard/accounting/trial-balance" },
      { label: "Laporan Laba Rugi", href: "/dashboard/accounting/profit-loss" },
      { label: "Neraca", href: "/dashboard/accounting/balance-sheet" },
      { label: "Arus Kas", href: "/dashboard/accounting/cash-flow" },
    ],
  },
  { label: "CRM", icon: Contact, href: "/dashboard/crm" },
  { label: "Laporan", icon: FileText, href: "/dashboard/reports" },
  { label: "Maintenance", icon: Wrench, href: "/dashboard/maintenance" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of menu) {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        init[item.label] = true;
      }
    }
    return init;
  });

  return (
    <aside
      className="w-64 shrink-0 h-screen sticky top-0 overflow-y-auto border-r flex flex-col"
      style={{ background: "#0E2A3A", borderColor: "#1E4A5E" }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "#1E4A5E" }}>
        <div className="flex items-center text-xl font-extrabold">
          <span style={{ color: "#2A7CB7" }}>MO</span>
          <svg width="20" height="20" viewBox="0 0 24 24" className="mx-[1px]" fill="none">
            <path d="M3 4l9 16 9-16" stroke="#F89C1D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14V2M7 7l5-5 5 5" stroke="#F89C1D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: "#F89C1D" }}>ERA</span>
        </div>
        <div className="text-xs mt-1" style={{ color: "#9BB0BB" }}>
          PUSATERA ERP
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isOpen = !!open[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpen((prev) => ({ ...prev, [item.label]: !prev[item.label] }))
                  }
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5"
                >
                  <Icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={isOpen ? "rotate-180 transition" : "transition"}
                  />
                </button>
                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l pl-3" style={{ borderColor: "#1E4A5E" }}>
                    {item.children.map((c) => {
                      const active = pathname === c.href;
                      return (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block rounded-md px-3 py-1.5 text-sm hover:bg-white/5"
                          style={{
                            color: active ? "#2EC5E8" : "#9BB0BB",
                            background: active ? "rgba(46,197,232,0.1)" : undefined,
                          }}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href!) && item.href !== "/";
          return (
            <Link
              key={item.label}
              href={item.href!}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
              style={{
                color: active ? "#2EC5E8" : "#FFFFFF",
                background: active ? "rgba(46,197,232,0.1)" : undefined,
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "#1E4A5E" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}