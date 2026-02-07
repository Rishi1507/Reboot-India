import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { adminFetch, clearAdminToken, getAdminToken } from "@/lib/adminApi";

/* =========================
   TYPES
========================= */
type Tab =
  | "Treks"
  | "Departures"
  | "Bookings"
  | "Customers"
  | "Payments"
  | "Coupons"
  | "Email Logs";

/* =========================
   REUSABLE TABLE
========================= */
type Column<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
};

function DataTable<T>({
  columns,
  data,
}: {
  columns: Column<T>[];
  data: T[];
}) {
  return (
    <div className="overflow-x-auto border rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="text-left px-4 py-3 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((c, j) => (
                <td key={j} className="px-4 py-3">
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
   SEARCH + PAGINATION
========================= */
function useSearchPagination<T>(
  rows: T[],
  searchFn: (row: T, q: string) => boolean
) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(
    () => rows.filter((r) => searchFn(r, search)),
    [rows, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    data: paginated,
  };
}

/* =========================
   MAIN COMPONENT
========================= */
export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Treks");

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (!getAdminToken()) setLocation("/admin/login");
  }, [setLocation]);

  /* ---------- QUERIES ---------- */
  const treksQ = useQuery({
    queryKey: ["treks"],
    queryFn: () => adminFetch("/api/admin/treks"),
  });

  const bookingsQ = useQuery({
    queryKey: ["bookings"],
    queryFn: () => adminFetch("/api/admin/bookings"),
  });

  const customersQ = useQuery({
    queryKey: ["customers"],
    queryFn: () => adminFetch("/api/admin/customers"),
  });

  const paymentsQ = useQuery({
    queryKey: ["payments"],
    queryFn: () => adminFetch("/api/admin/payments"),
  });

  const couponsQ = useQuery({
    queryKey: ["coupons"],
    queryFn: () => adminFetch("/api/admin/coupons"),
  });

  const emailLogsQ = useQuery({
    queryKey: ["email-logs"],
    queryFn: () => adminFetch("/api/admin/email-logs"),
  });

  /* =========================
     SUMMARY + CHART
  ========================= */
  const summary = useMemo(() => {
    const payments = paymentsQ.data || [];
    const confirmed = payments.filter((p: any) => p.status === "SUCCESS");

    return {
      bookings: (bookingsQ.data || []).length,
      customers: (customersQ.data || []).length,
      revenue: confirmed.reduce((s: number, p: any) => s + p.amount, 0),
    };
  }, [bookingsQ.data, customersQ.data, paymentsQ.data]);

  const monthlyRevenue = useMemo(() => {
    const map: any = {};
    (paymentsQ.data || [])
      .filter((p: any) => p.status === "SUCCESS")
      .forEach((p: any) => {
        const k = new Date(p.createdAt).toLocaleString("en-IN", {
          month: "short",
          year: "numeric",
        });
        map[k] = (map[k] || 0) + p.amount;
      });
    return Object.entries(map).map(([month, amount]) => ({
      month,
      amount,
    }));
  }, [paymentsQ.data]);

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    clearAdminToken();
    setLocation("/admin/login");
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-offwhite">
      <Seo title="Admin Dashboard | Reboot India" />
      <Navigation />

      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button onClick={logout} className="underline text-sm">
            Logout
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Bookings" value={summary.bookings} />
          <SummaryCard label="Customers" value={summary.customers} />
          <SummaryCard label="Revenue (₹)" value={summary.revenue} />
        </div>

        {/* CHART */}
        <div className="bg-white border rounded-xl p-4 mb-8">
          <h3 className="font-semibold mb-2">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="amount" stroke="#7b1e1e" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              "Treks",
              "Departures",
              "Bookings",
              "Customers",
              "Payments",
              "Coupons",
              "Email Logs",
            ] as Tab[]
          ).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-full border ${
                activeTab === t ? "bg-maroon text-white" : "bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ================= TREKS ================= */}
        {activeTab === "Treks" && (
          <>
            <button className="mb-3 bg-maroon text-white px-4 py-2 rounded">
              + Add Trek
            </button>

            <DataTable
              data={treksQ.data || []}
              columns={[
                {
                  header: "Trek",
                  render: (t: any) => t.title,
                },
                {
                  header: "Departures",
                  render: (t: any) => t.departures?.length || 0,
                },
                {
                  header: "Bookings",
                  render: (t: any) => t.bookings?.length || 0,
                },
                {
                  header: "Occupancy",
                  render: (t: any) => {
                    const occ =
                      t.departures?.length > 0
                        ? Math.round(
                            (t.departures.reduce(
                              (s: number, d: any) =>
                                s + d.bookedSeats / d.totalSeats,
                              0
                            ) /
                              t.departures.length) *
                              100
                          )
                        : 0;
                    return `${occ}%`;
                  },
                },
              ]}
            />
          </>
        )}

        {/* ================= BOOKINGS ================= */}
        {activeTab === "Bookings" && (
          <DataTable
            data={bookingsQ.data || []}
            columns={[
              { header: "Customer", render: (b: any) => b.customer?.fullName },
              { header: "Trek", render: (b: any) => b.trek?.title },
              { header: "Seats", render: (b: any) => b.numberOfSeats },
              {
                header: "Amount",
                render: (b: any) => `₹${b.finalAmount}`,
              },
              { header: "Status", render: (b: any) => b.status },
            ]}
          />
        )}

        {/* ================= CUSTOMERS ================= */}
        {activeTab === "Customers" && (
          <DataTable
            data={customersQ.data || []}
            columns={[
              { header: "Name", render: (c: any) => c.fullName },
              { header: "Email", render: (c: any) => c.email },
              {
                header: "Bookings",
                render: (c: any) => c.bookings?.length || 0,
              },
              {
                header: "Spend",
                render: (c: any) =>
                  `₹${(c.bookings || []).reduce(
                    (s: number, b: any) => s + b.finalAmount,
                    0
                  )}`,
              },
            ]}
          />
        )}

        {/* ================= PAYMENTS ================= */}
        {activeTab === "Payments" && (
          <DataTable
            data={paymentsQ.data || []}
            columns={[
              { header: "Amount", render: (p: any) => `₹${p.amount}` },
              { header: "Status", render: (p: any) => p.status },
              {
                header: "Date",
                render: (p: any) =>
                  new Date(p.createdAt).toLocaleDateString(),
              },
            ]}
          />
        )}

        {/* ================= COUPONS ================= */}
        {activeTab === "Coupons" && (
          <DataTable
            data={couponsQ.data || []}
            columns={[
              { header: "Code", render: (c: any) => c.code },
              { header: "Type", render: (c: any) => c.type },
              { header: "Value", render: (c: any) => c.value },
              {
                header: "Status",
                render: (c: any) => (c.isActive ? "Active" : "Inactive"),
              },
            ]}
          />
        )}

        {/* ================= EMAIL LOGS ================= */}
        {activeTab === "Email Logs" && (
          <DataTable
            data={emailLogsQ.data || []}
            columns={[
              { header: "To", render: (e: any) => e.to },
              { header: "Subject", render: (e: any) => e.subject },
              { header: "Status", render: (e: any) => e.status },
            ]}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

/* =========================
   SUMMARY CARD
========================= */
function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
