import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { adminFetch, clearAdminToken, getAdminToken } from "@/lib/adminApi";
import { queryClient } from "@/lib/queryClient";

const tabs = [
  "Treks",
  "Departures",
  "Bookings",
  "Customers",
  "Payments",
  "Coupons",
  "Email Logs",
] as const;

type Tab = (typeof tabs)[number];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Treks");
  const [selectedTrek, setSelectedTrek] = useState<any>(null);

  /* ================= ALERT ================= */
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const showSuccess = (m: string) => setAlert({ message: m, type: "success" });
  const showError = (m: string) => setAlert({ message: m, type: "error" });

  useEffect(() => {
    if (!getAdminToken()) setLocation("/admin/login");
  }, []);

  /* ================= FORMS ================= */

  const [trekForm, setTrekForm] = useState<any>({
    title: "",
    slug: "",
    description: "",
    duration: "",
    difficulty: "",
    season: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    originalPrice: "",
    discountedPrice: "",
    coverImage: "",
    gallery: "[]",
    itinerary: "[]",
    isActive: true,
    syncDeparturePrices: true,
  });

  const [departureForm, setDepartureForm] = useState<any>({
    trekId: "",
    startDate: "",
    endDate: "",
    totalSeats: 20,
    pricePerSeat: 8000,
  });

  const [couponForm, setCouponForm] = useState<any>({
    code: "",
    type: "PERCENT",
    value: 10,
    validFrom: "",
    validTo: "",
    maxUses: "",
    maxUsesPerEmail: "",
    minAmount: "",
    isActive: true,
  });

  /* ================= QUERIES ================= */

  const treksQuery = useQuery({
    queryKey: ["admin-treks"],
    queryFn: () => adminFetch("/api/admin/treks"),
  });

  const departuresQuery = useQuery({
    queryKey: ["admin-departures"],
    queryFn: async () => {
      const treks = await adminFetch("/api/admin/treks");
      return treks.flatMap((t: any) =>
        (t.departures || []).map((d: any) => ({
          ...d,
          trekTitle: t.title,
        }))
      );
    },
  });

  const couponsQuery = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => adminFetch("/api/admin/coupons"),
  });

  const trekOptions = useMemo(() => treksQuery.data || [], [treksQuery.data]);

  /* ================= MUTATIONS ================= */

  const saveTrek = useMutation({
    mutationFn: async () => {
      const payload = {
        ...trekForm,
        gallery: JSON.parse(trekForm.gallery || "[]"),
        itinerary: JSON.parse(trekForm.itinerary || "[]"),
        originalPrice: trekForm.originalPrice
          ? Number(trekForm.originalPrice)
          : null,
        discountedPrice: trekForm.discountedPrice
          ? Number(trekForm.discountedPrice)
          : null,
      };

      if (selectedTrek?.id) {
        return adminFetch(`/api/admin/treks/${selectedTrek.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }

      return adminFetch("/api/admin/treks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-treks"] });
      setSelectedTrek(null);
      showSuccess("Trek saved");
    },
    onError: (e: any) => showError(e.message),
  });

  const toggleTrekStatus = async (id: string, isActive: boolean) => {
    if (!confirm(`${isActive ? "Deactivate" : "Activate"} this trek?`)) return;
    try {
      await adminFetch(`/api/admin/treks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !isActive }),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-treks"] });
      showSuccess("Trek updated");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const createDeparture = useMutation({
    mutationFn: () =>
      adminFetch(`/api/admin/treks/${departureForm.trekId}/departures`, {
        method: "POST",
        body: JSON.stringify({
          startDate: new Date(departureForm.startDate),
          endDate: new Date(departureForm.endDate),
          totalSeats: Number(departureForm.totalSeats),
          pricePerSeat: Number(departureForm.pricePerSeat),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
      showSuccess("Departure created");
    },
    onError: (e: any) => showError(e.message),
  });

  const deleteDeparture = async (id: string) => {
    if (!confirm("Delete this departure?")) return;
    try {
      await adminFetch(`/api/admin/departures/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
      showSuccess("Departure deleted");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const saveCoupon = useMutation({
    mutationFn: async () => {
      const payload = {
        ...couponForm,
        code: couponForm.code.trim().toUpperCase(),
        value: Number(couponForm.value),
        validFrom: couponForm.validFrom || null,
        validTo: couponForm.validTo || null,
        maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
        maxUsesPerEmail: couponForm.maxUsesPerEmail
          ? Number(couponForm.maxUsesPerEmail)
          : null,
        minAmount: couponForm.minAmount
          ? Number(couponForm.minAmount)
          : null,
      };

      return adminFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      showSuccess("Coupon saved");
    },
    onError: (e: any) => showError(e.message),
  });

  const toggleCouponStatus = async (id: string, isActive: boolean) => {
    if (!confirm(`${isActive ? "Deactivate" : "Activate"} this coupon?`)) return;
    try {
      await adminFetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !isActive }),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      showSuccess("Coupon updated");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const logout = () => {
    clearAdminToken();
    setLocation("/admin/login");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo title="Admin Dashboard" />
      <Navigation />

      {alert && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-4 py-2 rounded">
          {alert.message}
          <button className="ml-3" onClick={() => setAlert(null)}>✕</button>
        </div>
      )}

      <div className="container mx-auto pt-28 pb-16">

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 border rounded ${
                activeTab === t ? "bg-maroon text-white" : "bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ================= TREKS ================= */}
        {activeTab === "Treks" && (
          <div className="grid grid-cols-2 gap-8">
            <div>
              {(treksQuery.data || []).map((t: any) => (
                <div key={t.id} className="border bg-white p-4 mb-3 rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs">{t.slug}</div>
                      <div className="text-xs">
                        {t.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedTrek(t);
                          setTrekForm({
                            ...t,
                            gallery: JSON.stringify(t.gallery || []),
                            itinerary: JSON.stringify(t.itinerary || []),
                          });
                        }}
                        className="underline text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleTrekStatus(t.id, t.isActive)}
                        className="underline text-sm"
                      >
                        {t.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Trek Form */}
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">
                {selectedTrek ? "Edit Trek" : "Create Trek"}
              </h3>

              {[
                "title",
                "slug",
                "description",
                "duration",
                "difficulty",
                "season",
                "shortDescription",
                "fullDescription",
                "price",
                "originalPrice",
                "discountedPrice",
                "coverImage",
              ].map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  className="border p-2 w-full mb-2"
                  value={trekForm[key] || ""}
                  onChange={(e) =>
                    setTrekForm({ ...trekForm, [key]: e.target.value })
                  }
                />
              ))}

              <textarea
                placeholder="Gallery JSON"
                className="border p-2 w-full mb-2"
                value={trekForm.gallery}
                onChange={(e) =>
                  setTrekForm({ ...trekForm, gallery: e.target.value })
                }
              />

              <textarea
                placeholder="Itinerary JSON"
                className="border p-2 w-full mb-2"
                value={trekForm.itinerary}
                onChange={(e) =>
                  setTrekForm({ ...trekForm, itinerary: e.target.value })
                }
              />

              <button
                onClick={() => saveTrek.mutate()}
                className="bg-maroon text-white px-4 py-2 rounded"
              >
                Save Trek
              </button>
            </div>
          </div>
        )}

        {/* ================= DEPARTURES ================= */}
        {activeTab === "Departures" && (
          <div>
            {(departuresQuery.data || []).map((d: any) => (
              <div key={d.id} className="border bg-white p-4 mb-2">
                {d.trekTitle} — {new Date(d.startDate).toDateString()}
                <button
                  onClick={() => deleteDeparture(d.id)}
                  className="ml-4 text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}

            <div className="bg-white border p-4 mt-6">
              <h3>Create Departure</h3>
              <select
                className="border p-2 mb-2"
                onChange={(e) =>
                  setDepartureForm({ ...departureForm, trekId: e.target.value })
                }
              >
                <option>Select Trek</option>
                {trekOptions.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border p-2 mb-2"
                onChange={(e) =>
                  setDepartureForm({
                    ...departureForm,
                    startDate: e.target.value,
                  })
                }
              />

              <input
                type="date"
                className="border p-2 mb-2"
                onChange={(e) =>
                  setDepartureForm({
                    ...departureForm,
                    endDate: e.target.value,
                  })
                }
              />

              <button
                onClick={() => createDeparture.mutate()}
                className="bg-maroon text-white px-4 py-2"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* ================= COUPONS ================= */}
        {activeTab === "Coupons" && (
          <div className="grid grid-cols-2 gap-8">
            <div>
              {(couponsQuery.data || []).map((c: any) => (
                <div key={c.id} className="border bg-white p-4 mb-2">
                  {c.code} — {c.type} — {c.value} —{" "}
                  {c.isActive ? "Active" : "Inactive"}

                  <button
                    onClick={() => toggleCouponStatus(c.id, c.isActive)}
                    className="ml-4 underline"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white border p-4">
              <h3>Create Coupon</h3>

              {[
                "code",
                "value",
                "validFrom",
                "validTo",
                "maxUses",
                "maxUsesPerEmail",
                "minAmount",
              ].map((key) => (
                <input
                  key={key}
                  placeholder={key}
                  className="border p-2 w-full mb-2"
                  value={couponForm[key] || ""}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, [key]: e.target.value })
                  }
                />
              ))}

              <select
                className="border p-2 mb-2"
                onChange={(e) =>
                  setCouponForm({ ...couponForm, type: e.target.value })
                }
              >
                <option value="PERCENT">Percent</option>
                <option value="AMOUNT">Amount</option>
              </select>

              <button
                onClick={() => saveCoupon.mutate()}
                className="bg-maroon text-white px-4 py-2"
              >
                Save Coupon
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
