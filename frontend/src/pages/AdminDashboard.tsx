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
  "Page FAQs",
  "Trek Blogs",
  "Trek Reviews",
] as const;

type Tab = (typeof tabs)[number];

const createBlogForm = (trekId = "") => ({
  id: "",
  trekId,
  title: "",
  slug: "",
  author: "Admin",
  status: "DRAFT",
  shortIntro: "",
  content: "",
  personalExperience: "",
  highlightsText: "",
  lessonsLearned: "",
  itineraryText: "",
  featuredImage: "",
  galleryText: "",
  videoUrl: "",
  imageAltText: "",
  bestTimeToVisit: "",
  temperatureRange: "",
  fitnessLevelRequired: "",
  gearListText: "",
  permitsRequired: false,
  permitsDescription: "",
  estimatedCost: "",
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  openGraphImage: "",
  publishAt: "",
  featured: false,
  showOnHomepage: false,
});

const createReviewForm = (trekId = "") => ({
  id: "",
  trekId,
  reviewerName: "",
  reviewerPhotoUrl: "",
  rating: 5,
  reviewTitle: "",
  reviewText: "",
  trekDate: "",
  location: "",
  recommend: true,
  featured: false,
  status: "DRAFT",
  displayOrder: "",
});

const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Treks");
  const [selectedTrek, setSelectedTrek] = useState<any>(null);
  const [trekSearch, setTrekSearch] = useState("");
  const [blogFilters, setBlogFilters] = useState({
    trekId: "",
    status: "",
    featured: "",
  });
  const [reviewFilters, setReviewFilters] = useState({
    trekId: "",
    rating: "",
    status: "",
    featured: "",
  });
  const [blogForm, setBlogForm] = useState<any>(createBlogForm());
  const [reviewForm, setReviewForm] = useState<any>(createReviewForm());
  const [blogFormDirty, setBlogFormDirty] = useState(false);

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

  const [faqForm, setFaqForm] = useState<any>({
    id: "",
    pageKey: "/",
    question: "",
    answer: "",
    sortOrder: 0,
    isActive: true,
  });
  const [selectedDepartureId, setSelectedDepartureId] = useState("");
  const [batchSubject, setBatchSubject] = useState("");
  const [batchMessage, setBatchMessage] = useState("");
  const [selectedBatchBookingIds, setSelectedBatchBookingIds] = useState<string[]>([]);

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

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => adminFetch("/api/admin/bookings"),
  });

  const customersQuery = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => adminFetch("/api/admin/customers"),
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments"],
    queryFn: () => adminFetch("/api/admin/payments"),
  });

  const emailLogsQuery = useQuery({
    queryKey: ["admin-email-logs"],
    queryFn: () => adminFetch("/api/admin/email-logs"),
  });

  const faqsQuery = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: () => adminFetch("/api/admin/faqs"),
  });

  const batchBookingsQuery = useQuery({
    queryKey: ["admin-batch-bookings", selectedDepartureId],
    enabled: Boolean(selectedDepartureId),
    queryFn: () => adminFetch(`/api/admin/departures/${selectedDepartureId}/manage-batch`),
  });

  const blogsQuery = useQuery({
    queryKey: ["admin-trek-blogs", blogFilters],
    queryFn: () => {
      const q = new URLSearchParams();
      if (blogFilters.trekId) q.set("trekId", blogFilters.trekId);
      if (blogFilters.status) q.set("status", blogFilters.status);
      if (blogFilters.featured) q.set("featured", blogFilters.featured);
      return adminFetch(`/api/admin/trek-blogs?${q.toString()}`);
    },
  });

  const reviewsQuery = useQuery({
    queryKey: ["admin-trek-reviews", reviewFilters],
    queryFn: () => {
      const q = new URLSearchParams();
      if (reviewFilters.trekId) q.set("trekId", reviewFilters.trekId);
      if (reviewFilters.rating) q.set("rating", reviewFilters.rating);
      if (reviewFilters.status) q.set("status", reviewFilters.status);
      if (reviewFilters.featured) q.set("featured", reviewFilters.featured);
      return adminFetch(`/api/admin/trek-reviews?${q.toString()}`);
    },
  });

  const trekOptions = useMemo(() => treksQuery.data || [], [treksQuery.data]);
  const filteredTreks = useMemo(() => {
    const q = trekSearch.trim().toLowerCase();
    if (!q) return trekOptions;
    return trekOptions.filter((t: any) =>
      [t.title, t.location, t.difficulty].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [trekOptions, trekSearch]);

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

  const saveFaq = useMutation({
    mutationFn: async () => {
      const payload = {
        pageKey: faqForm.pageKey.trim() || "/",
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        sortOrder: Number(faqForm.sortOrder || 0),
        isActive: Boolean(faqForm.isActive),
      };
      if (faqForm.id) {
        return adminFetch(`/api/admin/faqs/${faqForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      return adminFetch("/api/admin/faqs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setFaqForm({
        id: "",
        pageKey: "/",
        question: "",
        answer: "",
        sortOrder: 0,
        isActive: true,
      });
      showSuccess("FAQ saved");
    },
    onError: (e: any) => showError(e.message),
  });

  const sendBatchMessage = useMutation({
    mutationFn: () => {
      if (!selectedDepartureId) throw new Error("Select a batch first");
      if (!batchSubject.trim() || !batchMessage.trim()) {
        throw new Error("Subject and message are required");
      }
      return adminFetch(`/api/admin/departures/${selectedDepartureId}/manage-batch/send-message`, {
        method: "POST",
        body: JSON.stringify({
          bookingIds: selectedBatchBookingIds.length ? selectedBatchBookingIds : undefined,
          subject: batchSubject.trim(),
          message: batchMessage.trim(),
        }),
      });
    },
    onSuccess: (res: any) => {
      showSuccess(`Message sent to ${res?.sent || 0} trekkers`);
    },
    onError: (e: any) => showError(e.message),
  });

  const sendBatchPaymentReminders = useMutation({
    mutationFn: () => {
      if (!selectedDepartureId) throw new Error("Select a batch first");
      return adminFetch(`/api/admin/departures/${selectedDepartureId}/send-payment-reminders`, {
        method: "POST",
      });
    },
    onSuccess: (res: any) => {
      showSuccess(`Payment reminders sent to ${res?.sent || 0} trekkers`);
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
    onError: (e: any) => showError(e.message),
  });

  const saveBlog = useMutation({
    mutationFn: async (mode: "DRAFT" | "PUBLISHED" | "UNPUBLISHED") => {
      const payload = {
        ...blogForm,
        slug: blogForm.slug || slugify(blogForm.title),
        status: mode,
        highlights: blogForm.highlightsText
          .split("\n")
          .map((v: string) => v.trim())
          .filter(Boolean),
        itinerary: blogForm.itineraryText ? JSON.parse(blogForm.itineraryText) : [],
        gallery: blogForm.galleryText
          .split("\n")
          .map((v: string) => v.trim())
          .filter(Boolean),
        gearList: blogForm.gearListText
          .split("\n")
          .map((v: string) => v.trim())
          .filter(Boolean),
      };
      if (blogForm.id) {
        return adminFetch(`/api/admin/trek-blogs/${blogForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      return adminFetch("/api/admin/trek-blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (saved: any) => {
      setBlogForm((prev: any) => ({
        ...prev,
        id: saved.id,
        slug: saved.slug,
        status: saved.status,
      }));
      setBlogFormDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin-trek-blogs"] });
      showSuccess("Trek blog saved");
    },
    onError: (e: any) => showError(e.message),
  });

  const saveReview = useMutation({
    mutationFn: async (mode: "DRAFT" | "APPROVED") => {
      const payload = {
        ...reviewForm,
        status: mode,
      };
      if (reviewForm.id) {
        return adminFetch(`/api/admin/trek-reviews/${reviewForm.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      return adminFetch("/api/admin/trek-reviews", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (saved: any) => {
      setReviewForm((prev: any) => ({ ...prev, id: saved.id, status: saved.status }));
      queryClient.invalidateQueries({ queryKey: ["admin-trek-reviews"] });
      showSuccess("Trek review saved");
    },
    onError: (e: any) => showError(e.message),
  });

  useEffect(() => {
    if (activeTab !== "Trek Blogs") return;
    if (!blogFormDirty) return;
    if (!blogForm.trekId || !blogForm.title || !blogForm.shortIntro || !blogForm.content) return;
    const timer = setInterval(() => saveBlog.mutate("DRAFT"), 30000);
    return () => clearInterval(timer);
  }, [activeTab, blogFormDirty, blogForm]);

  useEffect(() => {
    setSelectedBatchBookingIds([]);
  }, [selectedDepartureId]);

  const loadBlog = (b: any) => {
    setBlogForm({
      ...createBlogForm(b.trekId),
      ...b,
      highlightsText: Array.isArray(b.highlights) ? b.highlights.join("\n") : "",
      itineraryText: JSON.stringify(b.itinerary || [], null, 2),
      galleryText: Array.isArray(b.gallery) ? b.gallery.join("\n") : "",
      gearListText: Array.isArray(b.gearList) ? b.gearList.join("\n") : "",
      keywords: Array.isArray(b.keywords) ? b.keywords.join(", ") : b.keywords || "",
      publishAt: b.publishAt ? String(b.publishAt).slice(0, 16) : "",
    });
    setBlogFormDirty(false);
  };

  const loadReview = (r: any) => {
    setReviewForm({
      ...createReviewForm(r.trekId),
      ...r,
      trekDate: r.trekDate ? String(r.trekDate).slice(0, 10) : "",
      displayOrder: r.displayOrder ?? "",
    });
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete blog?")) return;
    await adminFetch(`/api/admin/trek-blogs/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-trek-blogs"] });
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete review?")) return;
    await adminFetch(`/api/admin/trek-reviews/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["admin-trek-reviews"] });
  };

  const setReviewStatus = async (id: string, status: "APPROVED" | "HIDDEN") => {
    await adminFetch(`/api/admin/trek-reviews/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    queryClient.invalidateQueries({ queryKey: ["admin-trek-reviews"] });
  };

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

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await adminFetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      showSuccess("FAQ deleted");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const sendSinglePaymentReminder = async (bookingId: string) => {
    try {
      await adminFetch(`/api/admin/bookings/${bookingId}/send-payment-reminder`, {
        method: "POST",
      });
      showSuccess("Payment reminder sent");
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    } catch (e: any) {
      showError(e.message);
    }
  };

  const toggleBatchBookingSelection = (bookingId: string) => {
    setSelectedBatchBookingIds((prev) =>
      prev.includes(bookingId) ? prev.filter((id) => id !== bookingId) : [...prev, bookingId],
    );
  };

  const exportBatchCsv = () => {
    const rows = Array.isArray(batchBookingsQuery.data) ? batchBookingsQuery.data : [];
    if (!rows.length) return showError("No batch data to export");

    const headers = [
      "Trekking ID",
      "Customer Name",
      "Email",
      "Phone",
      "Trek",
      "Batch Start",
      "Batch End",
      "Seats",
      "Amount Paid",
      "Amount Due",
      "Payment Status",
      "Booking Status",
    ];

    const escapeCell = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((b: any) =>
      [
        b.trekkingId,
        b.customer?.fullName,
        b.customer?.email,
        b.customer?.phone,
        b.trek?.title,
        b.departure?.startDate ? new Date(b.departure.startDate).toDateString() : "",
        b.departure?.endDate ? new Date(b.departure.endDate).toDateString() : "",
        b.numberOfSeats,
        b.amountPaid,
        b.amountDue,
        b.paymentStatus,
        b.status,
      ]
        .map(escapeCell)
        .join(","),
    );

    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-${selectedDepartureId || "list"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const logout = () => {
    clearAdminToken();
    setLocation("/admin/login");
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Admin Dashboard | Reboot India"
        description="Manage treks, blogs, reviews and operations."
        canonical="https://rebootindia.co.in/admin"
      />
      <Navigation />

      {alert && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-4 py-2 rounded">
          {alert.message}
          <button className="ml-3" onClick={() => setAlert(null)}>x</button>
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
                      <button
                        onClick={() => {
                          setActiveTab("Trek Blogs");
                          setBlogForm(createBlogForm(t.id));
                          setBlogFormDirty(false);
                        }}
                        className="underline text-sm"
                      >
                        Add More Details
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("Trek Reviews");
                          setReviewForm(createReviewForm(t.id));
                        }}
                        className="underline text-sm"
                      >
                        Add Review
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
                "location",
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

        {activeTab === "Bookings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded p-4 space-y-3">
              <h3 className="font-semibold">Manage Batch</h3>
              <select
                className="border p-2 w-full"
                value={selectedDepartureId}
                onChange={(e) => setSelectedDepartureId(e.target.value)}
              >
                <option value="">Select batch</option>
                {(departuresQuery.data || []).map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.trekTitle} | {new Date(d.startDate).toDateString()} -{" "}
                    {new Date(d.endDate).toDateString()}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  className="border px-3 py-2 rounded"
                  onClick={exportBatchCsv}
                  disabled={!selectedDepartureId}
                >
                  Export Batch CSV
                </button>
                <button
                  className="border px-3 py-2 rounded"
                  onClick={() => sendBatchPaymentReminders.mutate()}
                  disabled={!selectedDepartureId || sendBatchPaymentReminders.isPending}
                >
                  {sendBatchPaymentReminders.isPending
                    ? "Sending reminders..."
                    : "Send Payment Reminders"}
                </button>
              </div>

              <input
                className="border p-2 w-full"
                placeholder="Custom message subject"
                value={batchSubject}
                onChange={(e) => setBatchSubject(e.target.value)}
              />
              <textarea
                className="border p-2 w-full h-24"
                placeholder="Custom message"
                value={batchMessage}
                onChange={(e) => setBatchMessage(e.target.value)}
              />
              <button
                className="bg-maroon text-white px-4 py-2 rounded"
                onClick={() => sendBatchMessage.mutate()}
                disabled={!selectedDepartureId || sendBatchMessage.isPending}
              >
                {sendBatchMessage.isPending
                  ? "Sending..."
                  : `Send Custom Message ${
                      selectedBatchBookingIds.length
                        ? `(${selectedBatchBookingIds.length} selected)`
                        : "(All in batch)"
                    }`}
              </button>

              {selectedDepartureId ? (
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded p-2">
                  {(batchBookingsQuery.data || []).map((b: any) => (
                    <label key={b.id} className="flex items-start gap-2 text-sm border-b pb-2">
                      <input
                        type="checkbox"
                        checked={selectedBatchBookingIds.includes(b.id)}
                        onChange={() => toggleBatchBookingSelection(b.id)}
                      />
                      <span>
                        {b.customer?.fullName} ({b.customer?.email}) | Trekking ID: {b.trekkingId} |
                        Due: ₹{b.amountDue}
                      </span>
                    </label>
                  ))}
                  {batchBookingsQuery.data?.length === 0 ? (
                    <div className="text-sm text-gray-500">No people found in this batch.</div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">All Bookings</h3>
              {(bookingsQuery.data || []).map((b: any) => (
                <div key={b.id} className="border bg-white rounded p-4">
                  <div className="font-semibold">{b.trek?.title}</div>
                  <div className="text-sm text-gray-600">
                    Trekking ID: {b.trekkingId} | {b.customer?.fullName} | {b.customer?.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    Seats: {b.numberOfSeats} | Paid: ₹{b.amountPaid} | Due: ₹{b.amountDue}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {b.status} | Payment: {b.paymentStatus} | Batch:{" "}
                    {new Date(b.departure?.startDate).toDateString()}
                  </div>
                  {b.amountDue > 0 ? (
                    <button
                      className="mt-2 border px-3 py-1 rounded text-sm"
                      onClick={() => sendSinglePaymentReminder(b.id)}
                    >
                      Send Payment Reminder
                    </button>
                  ) : null}
                </div>
              ))}
              {bookingsQuery.data?.length === 0 ? (
                <div className="text-sm text-gray-600">No bookings found.</div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === "Customers" && (
          <div className="space-y-3">
            {(customersQuery.data || []).map((c: any) => (
              <div key={c.id} className="border bg-white rounded p-4">
                <div className="font-semibold">{c.fullName}</div>
                <div className="text-sm text-gray-600">
                  {c.email} | {c.phone}
                </div>
                <div className="text-xs text-gray-500">Bookings: {(c.bookings || []).length}</div>
              </div>
            ))}
            {customersQuery.data?.length === 0 ? (
              <div className="text-sm text-gray-600">No customers found.</div>
            ) : null}
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="space-y-3">
            {(paymentsQuery.data || []).map((p: any) => (
              <div key={p.id} className="border bg-white rounded p-4">
                <div className="font-semibold">₹{p.amount}</div>
                <div className="text-sm text-gray-600">
                  Booking: {p.bookingId} | Stage: {p.stage} | Status: {p.status}
                </div>
                <div className="text-xs text-gray-500">
                  Provider: {p.provider} | {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {paymentsQuery.data?.length === 0 ? (
              <div className="text-sm text-gray-600">No payments found.</div>
            ) : null}
          </div>
        )}

        {activeTab === "Email Logs" && (
          <div className="space-y-3">
            {(emailLogsQuery.data || []).map((log: any) => (
              <div key={log.id} className="border bg-white rounded p-4">
                <div className="font-semibold">{log.subject}</div>
                <div className="text-sm text-gray-600">{log.to}</div>
                <div className="text-xs text-gray-500">
                  {log.status} | {new Date(log.createdAt).toLocaleString()}
                </div>
                {log.error ? <div className="text-xs text-red-600 mt-1">{log.error}</div> : null}
              </div>
            ))}
            {emailLogsQuery.data?.length === 0 ? (
              <div className="text-sm text-gray-600">No email logs found.</div>
            ) : null}
          </div>
        )}

        {activeTab === "Page FAQs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Existing FAQs</h3>
              {(faqsQuery.data || []).map((f: any) => (
                <div key={f.id} className="border rounded p-3 mb-2 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">
                    Page: {f.pageKey} | Order: {f.sortOrder} | {f.isActive ? "Active" : "Inactive"}
                  </div>
                  <div className="font-medium">{f.question}</div>
                  <div className="text-sm text-gray-700 mt-1">{f.answer}</div>
                  <div className="flex gap-3 mt-2 text-sm">
                    <button onClick={() => setFaqForm(f)} className="underline">
                      Edit
                    </button>
                    <button onClick={() => deleteFaq(f.id)} className="underline text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">{faqForm.id ? "Edit FAQ" : "Create FAQ"}</h3>
              <input
                className="border p-2 w-full mb-2"
                placeholder='Page Key (/, /about, /treks/:slug, /blog/:slug, *)'
                value={faqForm.pageKey}
                onChange={(e) => setFaqForm({ ...faqForm, pageKey: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Question"
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-24"
                placeholder="Answer"
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              />
              <input
                type="number"
                className="border p-2 w-full mb-2"
                placeholder="Sort Order"
                value={faqForm.sortOrder}
                onChange={(e) => setFaqForm({ ...faqForm, sortOrder: Number(e.target.value) })}
              />
              <label className="flex items-center gap-2 text-sm mb-3">
                <input
                  type="checkbox"
                  checked={faqForm.isActive}
                  onChange={(e) => setFaqForm({ ...faqForm, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => saveFaq.mutate()}
                  className="bg-maroon text-white px-4 py-2 rounded"
                >
                  Save FAQ
                </button>
                {faqForm.id ? (
                  <button
                    onClick={() =>
                      setFaqForm({
                        id: "",
                        pageKey: "/",
                        question: "",
                        answer: "",
                        sortOrder: 0,
                        isActive: true,
                      })
                    }
                    className="border px-4 py-2 rounded"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
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

        {activeTab === "Trek Blogs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Trek Blog List</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <select
                  className="border p-2 text-sm"
                  value={blogFilters.trekId}
                  onChange={(e) =>
                    setBlogFilters({ ...blogFilters, trekId: e.target.value })
                  }
                >
                  <option value="">All Treks</option>
                  {trekOptions.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
                <select
                  className="border p-2 text-sm"
                  value={blogFilters.status}
                  onChange={(e) =>
                    setBlogFilters({ ...blogFilters, status: e.target.value })
                  }
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="UNPUBLISHED">Unpublished</option>
                </select>
                <select
                  className="border p-2 text-sm"
                  value={blogFilters.featured}
                  onChange={(e) =>
                    setBlogFilters({ ...blogFilters, featured: e.target.value })
                  }
                >
                  <option value="">Featured/All</option>
                  <option value="true">Featured</option>
                  <option value="false">Non Featured</option>
                </select>
              </div>

              {(blogsQuery.data || []).map((b: any) => (
                <div key={b.id} className="border rounded p-3 mb-2 bg-gray-50">
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs">
                    {b.trek?.title} | {b.status} | Featured: {b.featured ? "Yes" : "No"}
                  </div>
                  <div className="flex gap-2 mt-2 text-sm">
                    <button onClick={() => loadBlog(b)} className="underline">
                      Edit
                    </button>
                    <button onClick={() => deleteBlog(b.id)} className="underline text-red-600">
                      Delete
                    </button>
                    <a
                      href={`/trek/${b.trek?.slug}/${b.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Add More Details</h3>
              <input
                className="border p-2 w-full mb-2"
                placeholder="Search trek"
                value={trekSearch}
                onChange={(e) => setTrekSearch(e.target.value)}
              />
              <select
                className="border p-2 w-full mb-2"
                value={blogForm.trekId}
                onChange={(e) => {
                  setBlogForm({ ...blogForm, trekId: e.target.value });
                  setBlogFormDirty(true);
                }}
              >
                <option value="">Select Trek</option>
                {filteredTreks.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title} | {t.location || "N/A"} | {t.difficulty}
                  </option>
                ))}
              </select>
              <input
                className="border p-2 w-full mb-2"
                placeholder="Blog Title"
                value={blogForm.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setBlogForm({ ...blogForm, title, slug: slugify(title) });
                  setBlogFormDirty(true);
                }}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="URL Slug"
                value={blogForm.slug}
                onChange={(e) => {
                  setBlogForm({ ...blogForm, slug: slugify(e.target.value) });
                  setBlogFormDirty(true);
                }}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Author Name"
                value={blogForm.author}
                onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-20"
                placeholder="Short Introduction"
                value={blogForm.shortIntro}
                onChange={(e) => {
                  setBlogForm({ ...blogForm, shortIntro: e.target.value });
                  setBlogFormDirty(true);
                }}
              />
              <textarea
                className="border p-2 w-full mb-2 h-28"
                placeholder="Full Description"
                value={blogForm.content}
                onChange={(e) => {
                  setBlogForm({ ...blogForm, content: e.target.value });
                  setBlogFormDirty(true);
                }}
              />
              <textarea
                className="border p-2 w-full mb-2 h-20"
                placeholder="Personal Experience / Story"
                value={blogForm.personalExperience}
                onChange={(e) => setBlogForm({ ...blogForm, personalExperience: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-16"
                placeholder="Key Highlights (one per line)"
                value={blogForm.highlightsText}
                onChange={(e) => setBlogForm({ ...blogForm, highlightsText: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-24"
                placeholder='Itinerary JSON [{"dayNumber":1,"title":"","description":"","distanceKm":"","altitude":"","stayType":""}]'
                value={blogForm.itineraryText}
                onChange={(e) => setBlogForm({ ...blogForm, itineraryText: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Featured Image URL"
                value={blogForm.featuredImage}
                onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="border p-2 w-full mb-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dataUrl = await fileToDataUrl(file);
                  setBlogForm({ ...blogForm, featuredImage: dataUrl });
                }}
              />
              {blogForm.featuredImage ? (
                <img src={blogForm.featuredImage} className="h-24 rounded border mb-2 object-cover" />
              ) : null}
              <input
                className="border p-2 w-full mb-2"
                placeholder="Video URL"
                value={blogForm.videoUrl}
                onChange={(e) => setBlogForm({ ...blogForm, videoUrl: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Best Time to Visit"
                value={blogForm.bestTimeToVisit}
                onChange={(e) => setBlogForm({ ...blogForm, bestTimeToVisit: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Temperature Range"
                value={blogForm.temperatureRange}
                onChange={(e) => setBlogForm({ ...blogForm, temperatureRange: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Fitness Level Required"
                value={blogForm.fitnessLevelRequired}
                onChange={(e) => setBlogForm({ ...blogForm, fitnessLevelRequired: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-16"
                placeholder="Gear List (one per line)"
                value={blogForm.gearListText}
                onChange={(e) => setBlogForm({ ...blogForm, gearListText: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={blogForm.permitsRequired}
                  onChange={(e) => setBlogForm({ ...blogForm, permitsRequired: e.target.checked })}
                />
                Permits Required
              </label>
              <textarea
                className="border p-2 w-full mb-2 h-16"
                placeholder="Permits Description"
                value={blogForm.permitsDescription}
                onChange={(e) => setBlogForm({ ...blogForm, permitsDescription: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Estimated Cost"
                value={blogForm.estimatedCost}
                onChange={(e) => setBlogForm({ ...blogForm, estimatedCost: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Meta Title"
                value={blogForm.metaTitle}
                onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
              />
              <textarea
                className="border p-2 w-full mb-2 h-16"
                placeholder="Meta Description"
                value={blogForm.metaDescription}
                onChange={(e) => setBlogForm({ ...blogForm, metaDescription: e.target.value })}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Keywords (comma separated)"
                value={blogForm.keywords}
                onChange={(e) => setBlogForm({ ...blogForm, keywords: e.target.value })}
              />
              <input
                type="datetime-local"
                className="border p-2 w-full mb-2"
                value={blogForm.publishAt}
                onChange={(e) => setBlogForm({ ...blogForm, publishAt: e.target.value })}
              />
              <div className="flex gap-3 text-sm mb-3">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={blogForm.featured} onChange={(e) => setBlogForm({ ...blogForm, featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={blogForm.showOnHomepage} onChange={(e) => setBlogForm({ ...blogForm, showOnHomepage: e.target.checked })} />
                  Show on Homepage
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => saveBlog.mutate("DRAFT")} className="bg-gray-700 text-white px-3 py-2 rounded">
                  Save Draft
                </button>
                <button onClick={() => saveBlog.mutate("PUBLISHED")} className="bg-maroon text-white px-3 py-2 rounded">
                  Publish
                </button>
                <button onClick={() => saveBlog.mutate("UNPUBLISHED")} className="border px-3 py-2 rounded">
                  Unpublish
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Trek Reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Review List</h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <select className="border p-2 text-sm" value={reviewFilters.trekId} onChange={(e) => setReviewFilters({ ...reviewFilters, trekId: e.target.value })}>
                  <option value="">All Treks</option>
                  {trekOptions.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <select className="border p-2 text-sm" value={reviewFilters.rating} onChange={(e) => setReviewFilters({ ...reviewFilters, rating: e.target.value })}>
                  <option value="">Rating</option>
                  {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select className="border p-2 text-sm" value={reviewFilters.status} onChange={(e) => setReviewFilters({ ...reviewFilters, status: e.target.value })}>
                  <option value="">Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="APPROVED">Approved</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
                <select className="border p-2 text-sm" value={reviewFilters.featured} onChange={(e) => setReviewFilters({ ...reviewFilters, featured: e.target.value })}>
                  <option value="">Featured</option>
                  <option value="true">Featured</option>
                  <option value="false">Non Featured</option>
                </select>
              </div>
              {(reviewsQuery.data || []).map((r: any) => (
                <div key={r.id} className="border rounded p-3 mb-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    {r.reviewerPhotoUrl ? <img src={r.reviewerPhotoUrl} className="w-10 h-10 rounded-full object-cover border" /> : <div className="w-10 h-10 rounded-full border" />}
                    <div>
                      <div className="font-medium">{r.reviewerName} ({r.rating}★)</div>
                      <div className="text-xs">{r.trek?.title} | {r.status} | Featured: {r.featured ? "Yes" : "No"}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm mt-2">
                    <button onClick={() => loadReview(r)} className="underline">Edit</button>
                    <button onClick={() => setReviewStatus(r.id, "APPROVED")} className="underline">Approve</button>
                    <button onClick={() => setReviewStatus(r.id, "HIDDEN")} className="underline">Hide</button>
                    <button onClick={() => deleteReview(r.id)} className="underline text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Add Review</h3>
              <input className="border p-2 w-full mb-2" placeholder="Search trek" value={trekSearch} onChange={(e) => setTrekSearch(e.target.value)} />
              <select className="border p-2 w-full mb-2" value={reviewForm.trekId} onChange={(e) => setReviewForm({ ...reviewForm, trekId: e.target.value })}>
                <option value="">Select Trek</option>
                {filteredTreks.map((t: any) => <option key={t.id} value={t.id}>{t.title} | {t.location || "N/A"} | {t.difficulty}</option>)}
              </select>
              <input className="border p-2 w-full mb-2" placeholder="Reviewer Name" value={reviewForm.reviewerName} onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })} />
              <input className="border p-2 w-full mb-2" placeholder="Reviewer Photo URL" value={reviewForm.reviewerPhotoUrl} onChange={(e) => setReviewForm({ ...reviewForm, reviewerPhotoUrl: e.target.value })} />
              <input type="file" accept="image/*" className="border p-2 w-full mb-2" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setReviewForm({ ...reviewForm, reviewerPhotoUrl: dataUrl });
              }} />
              {reviewForm.reviewerPhotoUrl ? <img src={reviewForm.reviewerPhotoUrl} className="h-16 w-16 rounded-full border object-cover mb-2" /> : null}
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })} className={s <= Number(reviewForm.rating) ? "text-yellow-500 text-xl" : "text-gray-300 text-xl"}>★</button>
                ))}
              </div>
              <input className="border p-2 w-full mb-2" placeholder="Review Title" value={reviewForm.reviewTitle} onChange={(e) => setReviewForm({ ...reviewForm, reviewTitle: e.target.value })} />
              <textarea className="border p-2 w-full mb-2 h-24" placeholder="Review Description" value={reviewForm.reviewText} onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })} />
              <input type="date" className="border p-2 w-full mb-2" value={reviewForm.trekDate} onChange={(e) => setReviewForm({ ...reviewForm, trekDate: e.target.value })} />
              <input className="border p-2 w-full mb-2" placeholder="Location / City" value={reviewForm.location} onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })} />
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={reviewForm.recommend} onChange={(e) => setReviewForm({ ...reviewForm, recommend: e.target.checked })} />
                Would Recommend
              </label>
              <label className="flex items-center gap-2 text-sm mb-2">
                <input type="checkbox" checked={reviewForm.featured} onChange={(e) => setReviewForm({ ...reviewForm, featured: e.target.checked })} />
                Featured Review
              </label>
              <select className="border p-2 w-full mb-2" value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}>
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved</option>
                <option value="HIDDEN">Hidden</option>
              </select>
              <input type="number" className="border p-2 w-full mb-2" placeholder="Display Order" value={reviewForm.displayOrder} onChange={(e) => setReviewForm({ ...reviewForm, displayOrder: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={() => saveReview.mutate("DRAFT")} className="bg-gray-700 text-white px-3 py-2 rounded">Save Draft</button>
                <button onClick={() => saveReview.mutate("APPROVED")} className="bg-maroon text-white px-3 py-2 rounded">Publish</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

