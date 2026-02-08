export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Treks");

  useEffect(() => {
    if (!getAdminToken()) setLocation("/admin/login");
  }, [setLocation]);

  /* =========================
     DATA
  ========================= */
  const treksQ = useQuery({
    queryKey: ["admin-treks"],
    queryFn: () => adminFetch("/api/admin/treks"),
  });

  const bookingsQ = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminFetch("/api/admin/bookings"),
  });

  const customersQ = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminFetch("/api/admin/customers"),
  });

  const paymentsQ = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminFetch("/api/admin/payments"),
  });

  const couponsQ = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => adminFetch("/api/admin/coupons"),
  });

  const emailLogsQ = useQuery({
    queryKey: ["admin-email-logs"],
    queryFn: () => adminFetch("/api/admin/email-logs"),
  });

  const logout = () => {
    clearAdminToken();
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo title="Admin Dashboard | Reboot India" />
      <Navigation />

      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={logout} className="underline text-sm">
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "Treks",
            "Departures",
            "Bookings",
            "Customers",
            "Payments",
            "Coupons",
            "Email Logs",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as Tab)}
              className={`px-4 py-2 rounded border ${
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
              + Create Trek
            </button>

            <DataTable
              data={treksQ.data || []}
              columns={[
                { header: "Title", render: (t: any) => t.title },
                { header: "Slug", render: (t: any) => t.slug },
                { header: "Price", render: (t: any) => `₹${t.price}` },
                {
                  header: "Status",
                  render: (t: any) =>
                    t.isActive ? "Active" : "Inactive",
                },
                {
                  header: "Action",
                  render: (t: any) => (
                    <button className="underline text-sm">
                      Edit
                    </button>
                  ),
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
              { header: "Amount", render: (b: any) => `₹${b.finalAmount}` },
              {
                header: "Status",
                render: (b: any) => (
                  <select
                    defaultValue={b.status}
                    className="border px-2 py-1"
                  >
                    <option>PENDING</option>
                    <option>CONFIRMED</option>
                    <option>CANCELLED</option>
                  </select>
                ),
              },
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
          <>
            <button className="mb-3 bg-maroon text-white px-4 py-2 rounded">
              + Create Coupon
            </button>

            <DataTable
              data={couponsQ.data || []}
              columns={[
                { header: "Code", render: (c: any) => c.code },
                { header: "Type", render: (c: any) => c.type },
                { header: "Value", render: (c: any) => c.value },
                {
                  header: "Status",
                  render: (c: any) =>
                    c.isActive ? "Active" : "Inactive",
                },
              ]}
            />
          </>
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
