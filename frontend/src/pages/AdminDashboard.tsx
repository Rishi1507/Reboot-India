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
  "Admin Users",
  "Contact Messages",
  "Newsletter",
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

const pad2 = (n: number) => String(n).padStart(2, "0");
const toDateInputValue = (value: any) => {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

async function fileToDataUrl(file: File) {
  const toDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const isSvg =
    file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  if (isSvg) return toDataUrl(file);

  // If it's already small, keep original (helps preserve PNG transparency, etc).
  if (file.size <= 1_500_000) return toDataUrl(file);

  // Resize + compress large images to avoid "payload too large" errors.
  const inputUrl = await toDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = inputUrl;
  });

  const maxDim = 1600;
  const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
  const width = Math.max(1, Math.round((img.width || 1) * scale));
  const height = Math.max(1, Math.round((img.height || 1) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return inputUrl;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function AdminUserCreateForm({
  onCreate,
}: {
  onCreate: (payload: { email: string; name?: string; password: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-2">
      <input
        className="border p-2 w-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="password"
        className="border p-2 w-full"
        placeholder="Password (min 8 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-maroon text-white px-4 py-2 rounded"
        onClick={() => {
          onCreate({ email: email.trim(), name: name.trim() || undefined, password: password.trim() });
          setEmail("");
          setName("");
          setPassword("");
        }}
      >
        Create Admin
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("Treks");
  const [selectedTrek, setSelectedTrek] = useState<any>(null);
  const [trekSearch, setTrekSearch] = useState("");
  const sanityStudioUrl = import.meta.env.VITE_SANITY_STUDIO_URL || "http://localhost:3333";
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
  const ensureSvgFile = (file: File) => {
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    if (!isSvg) {
      showError("Only SVG images are allowed. Please upload a .svg file.");
      return false;
    }
    return true;
  };

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

  const [editDepartureForm, setEditDepartureForm] = useState<any>({
    id: "",
    trekTitle: "",
    startDate: "",
    endDate: "",
    totalSeats: 0,
    bookedSeats: 0,
    pricePerSeat: 0,
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
  const [bookingFilters, setBookingFilters] = useState({
    q: "",
    trekId: "",
    departureId: "",
    status: "",
    paymentStatus: "",
  });

  /* ================= QUERIES ================= */

  const treksQuery = useQuery({
    queryKey: ["admin-treks"],
    queryFn: () => adminFetch("/api/admin/treks"),
  });

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => adminFetch("/api/admin/me"),
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

  const adminUsersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminFetch("/api/admin/admin-users"),
  });

  const contactMessagesQuery = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: () => adminFetch("/api/admin/contact-messages"),
  });

  const newsletterQuery = useQuery({
    queryKey: ["admin-newsletter-subscribers"],
    queryFn: () => adminFetch("/api/admin/newsletter-subscribers"),
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

  const updateDeparture = useMutation({
    mutationFn: async () => {
      if (!editDepartureForm.id) throw new Error("Select a departure to edit");
      return adminFetch(`/api/admin/departures/${editDepartureForm.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          startDate: new Date(editDepartureForm.startDate),
          endDate: new Date(editDepartureForm.endDate),
          totalSeats: Number(editDepartureForm.totalSeats),
          pricePerSeat: Number(editDepartureForm.pricePerSeat),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setEditDepartureForm({
        id: "",
        trekTitle: "",
        startDate: "",
        endDate: "",
        totalSeats: 0,
        bookedSeats: 0,
        pricePerSeat: 0,
      });
      showSuccess("Departure updated");
    },
    onError: (e: any) => showError(e.message),
  });

  const beginEditDeparture = (d: any) => {
    setEditDepartureForm({
      id: d.id,
      trekTitle: d.trekTitle || "",
      startDate: toDateInputValue(d.startDate),
      endDate: toDateInputValue(d.endDate),
      totalSeats: Number(d.totalSeats || 0),
      bookedSeats: Number(d.bookedSeats || 0),
      pricePerSeat: Number(d.pricePerSeat || 0),
    });
  };

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

  const shareCoupon = async (id: string, code: string) => {
    const emailsRaw = prompt("Enter recipient emails (comma separated):");
    if (!emailsRaw) return;
    const note = prompt("Personalised note / terms (optional):") || "";
    const emails = emailsRaw
      .split(/[, \n]/)
      .map((v) => v.trim())
      .filter(Boolean);

    if (!emails.length) return showError("At least one email is required");

    try {
      const res = await adminFetch(`/api/admin/coupons/${id}/share`, {
        method: "POST",
        body: JSON.stringify({ emails, note }),
      });
      showSuccess(`Coupon ${code} shared with ${res?.sent || emails.length} user(s)`);
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

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Delete/cancel this booking?")) return;
    try {
      await adminFetch(`/api/admin/bookings/${bookingId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
      showSuccess("Booking cancelled");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const permanentlyDeleteBooking = async (bookingId: string) => {
    if (!meQuery.data?.isMaster) return showError("Master admin only");
    if (!confirm("Permanently delete this booking? This cannot be undone.")) return;
    try {
      await adminFetch(`/api/admin/bookings/${bookingId}/permanent`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
      showSuccess("Booking permanently deleted");
    } catch (e: any) {
      const msg = String(e?.message || "Request failed");
      if (msg.includes("?force=true")) {
        if (!confirm("This booking has payments. Permanently delete anyway?")) return;
        try {
          await adminFetch(`/api/admin/bookings/${bookingId}/permanent?force=true`, {
            method: "DELETE",
          });
          queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["admin-departures"] });
          showSuccess("Booking permanently deleted");
          return;
        } catch (e2: any) {
          return showError(e2.message);
        }
      }
      showError(msg);
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

  const createAdminUser = async (payload: { email: string; name?: string; password: string }) => {
    try {
      await adminFetch("/api/admin/admin-users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("Admin user created");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const resetAdminPassword = async (id: string) => {
    const password = prompt("Enter a new password (min 8 characters):");
    if (!password) return;
    try {
      await adminFetch(`/api/admin/admin-users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      showSuccess("Password updated");
    } catch (e: any) {
      showError(e.message);
    }
  };

  const deleteAdminUser = async (id: string) => {
    if (!confirm("Remove admin access for this user?")) return;
    try {
      await adminFetch(`/api/admin/admin-users/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("Admin user removed");
    } catch (e: any) {
      showError(e.message);
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-700">
            {meQuery.data?.email ? (
              <span>
                Signed in as <span className="font-medium">{meQuery.data.email}</span>
                {meQuery.data.isMaster ? (
                  <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                    Master
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <button className="border px-3 py-2 rounded" onClick={logout}>
            Logout
          </button>
        </div>

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
            <div className="overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Slug</th>
                    <th className="text-left p-3">Active</th>
                    <th className="text-left p-3">Departures</th>
                    <th className="text-left p-3">Bookings</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(treksQuery.data || []).map((t: any) => (
                    <tr key={t.id} className="border-t align-top">
                      <td className="p-3 font-medium">{t.title}</td>
                      <td className="p-3 text-xs font-mono">{t.slug}</td>
                      <td className="p-3">{t.isActive ? "Yes" : "No"}</td>
                      <td className="p-3">{(t.departures || []).length}</td>
                      <td className="p-3">{(t.bookings || []).length}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-3">
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
                            Blog
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("Trek Reviews");
                              setReviewForm(createReviewForm(t.id));
                            }}
                            className="underline text-sm"
                          >
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {treksQuery.data?.length === 0 ? (
                    <tr className="border-t">
                      <td className="p-3 text-gray-600" colSpan={6}>
                        No treks found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
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

              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="border p-2 w-full mb-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!ensureSvgFile(file)) return;
                  const dataUrl = await fileToDataUrl(file);
                  setTrekForm({ ...trekForm, coverImage: dataUrl });
                }}
              />

              <div className="text-xs text-gray-600 mb-1">Gallery (SVG upload or JSON)</div>
              <input
                type="file"
                multiple
                accept=".svg,image/svg+xml"
                className="border p-2 w-full mb-2"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  for (const f of files) {
                    if (!ensureSvgFile(f)) return;
                  }
                  const urls = await Promise.all(files.map((f) => fileToDataUrl(f)));
                  let current: any[] = [];
                  try {
                    current = JSON.parse(trekForm.gallery || "[]");
                    if (!Array.isArray(current)) current = [];
                  } catch {
                    current = [];
                  }
                  setTrekForm({ ...trekForm, gallery: JSON.stringify([...current, ...urls]) });
                }}
              />

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
            <div className="overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left p-3">Trek</th>
                    <th className="text-left p-3">Start</th>
                    <th className="text-left p-3">End</th>
                    <th className="text-left p-3">Seats</th>
                    <th className="text-left p-3">Price/Seat</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(departuresQuery.data || []).map((d: any) => (
                    <tr key={d.id} className="border-t">
                      <td className="p-3">{d.trekTitle}</td>
                      <td className="p-3">{new Date(d.startDate).toDateString()}</td>
                      <td className="p-3">{new Date(d.endDate).toDateString()}</td>
                      <td className="p-3">
                        {d.bookedSeats || 0}/{d.totalSeats}
                      </td>
                      <td className="p-3">₹{d.pricePerSeat}</td>
                      <td className="p-3">
                        <div className="flex gap-3">
                          <button onClick={() => beginEditDeparture(d)} className="underline">
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDeparture(d.id)}
                            className="text-red-600 underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {departuresQuery.data?.length === 0 ? (
                    <tr className="border-t">
                      <td className="p-3 text-gray-600" colSpan={6}>
                        No departures found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {editDepartureForm.id ? (
              <div className="bg-white border p-4 mt-6 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Edit Departure</h3>
                    <div className="text-xs text-gray-600">
                      {editDepartureForm.trekTitle || "Departure"} • Booked{" "}
                      {editDepartureForm.bookedSeats}/{editDepartureForm.totalSeats}
                    </div>
                  </div>
                  <button
                    className="text-sm underline"
                    onClick={() =>
                      setEditDepartureForm({
                        id: "",
                        trekTitle: "",
                        startDate: "",
                        endDate: "",
                        totalSeats: 0,
                        bookedSeats: 0,
                        pricePerSeat: 0,
                      })
                    }
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="date"
                    className="border p-2"
                    value={editDepartureForm.startDate}
                    onChange={(e) =>
                      setEditDepartureForm({ ...editDepartureForm, startDate: e.target.value })
                    }
                  />
                  <input
                    type="date"
                    className="border p-2"
                    value={editDepartureForm.endDate}
                    onChange={(e) =>
                      setEditDepartureForm({ ...editDepartureForm, endDate: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min={editDepartureForm.bookedSeats || 0}
                    className="border p-2"
                    value={editDepartureForm.totalSeats}
                    onChange={(e) =>
                      setEditDepartureForm({
                        ...editDepartureForm,
                        totalSeats: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    type="number"
                    min={1}
                    className="border p-2"
                    value={editDepartureForm.pricePerSeat}
                    onChange={(e) =>
                      setEditDepartureForm({
                        ...editDepartureForm,
                        pricePerSeat: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateDeparture.mutate()}
                    className="bg-maroon text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : null}

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

              <input
                type="number"
                className="border p-2 mb-2 w-full"
                placeholder="Total Seats"
                value={departureForm.totalSeats}
                onChange={(e) =>
                  setDepartureForm({
                    ...departureForm,
                    totalSeats: Number(e.target.value),
                  })
                }
              />

              <input
                type="number"
                className="border p-2 mb-2 w-full"
                placeholder="Price Per Seat"
                value={departureForm.pricePerSeat}
                onChange={(e) =>
                  setDepartureForm({
                    ...departureForm,
                    pricePerSeat: Number(e.target.value),
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded p-4 space-y-3 lg:col-span-1">
              <h3 className="font-semibold">Batch Tools</h3>
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

            <div className="space-y-3 lg:col-span-2">
              <h3 className="font-semibold">All Bookings</h3>

              <div className="bg-white border rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input
                    className="border p-2 text-sm"
                    placeholder="Search (Trekking ID / email / name)"
                    value={bookingFilters.q}
                    onChange={(e) =>
                      setBookingFilters((p) => ({ ...p, q: e.target.value }))
                    }
                  />
                  <select
                    className="border p-2 text-sm"
                    value={bookingFilters.trekId}
                    onChange={(e) =>
                      setBookingFilters((p) => ({ ...p, trekId: e.target.value }))
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
                    value={bookingFilters.departureId}
                    onChange={(e) =>
                      setBookingFilters((p) => ({ ...p, departureId: e.target.value }))
                    }
                  >
                    <option value="">All Batches</option>
                    {(departuresQuery.data || []).map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.trekTitle} | {new Date(d.startDate).toDateString()}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border p-2 text-sm"
                    value={bookingFilters.status}
                    onChange={(e) =>
                      setBookingFilters((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <select
                    className="border p-2 text-sm"
                    value={bookingFilters.paymentStatus}
                    onChange={(e) =>
                      setBookingFilters((p) => ({ ...p, paymentStatus: e.target.value }))
                    }
                  >
                    <option value="">All Payments</option>
                    <option value="PENDING_ADVANCE">PENDING_ADVANCE</option>
                    <option value="ADVANCE_PAID">ADVANCE_PAID</option>
                    <option value="FULLY_PAID">FULLY_PAID</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto bg-white border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left p-3">Created</th>
                      <th className="text-left p-3">Trek</th>
                      <th className="text-left p-3">Batch</th>
                      <th className="text-left p-3">Trekking ID</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Seats</th>
                      <th className="text-left p-3">Paid</th>
                      <th className="text-left p-3">Due</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Payment</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows = Array.isArray(bookingsQuery.data) ? bookingsQuery.data : [];
                      const q = bookingFilters.q.trim().toLowerCase();
                      const filtered = rows.filter((b: any) => {
                        if (bookingFilters.trekId && b.trekId !== bookingFilters.trekId) return false;
                        if (
                          bookingFilters.departureId &&
                          b.departureId !== bookingFilters.departureId
                        )
                          return false;
                        if (bookingFilters.status && b.status !== bookingFilters.status) return false;
                        if (
                          bookingFilters.paymentStatus &&
                          b.paymentStatus !== bookingFilters.paymentStatus
                        )
                          return false;
                        if (!q) return true;
                        const hay = [
                          b.trekkingId,
                          b.customer?.fullName,
                          b.customer?.email,
                          b.customer?.phone,
                        ]
                          .filter(Boolean)
                          .join(" ")
                          .toLowerCase();
                        return hay.includes(q);
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr className="border-t">
                            <td className="p-3 text-gray-600" colSpan={11}>
                              No bookings found.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((b: any) => (
                        <tr key={b.id} className="border-t align-top">
                          <td className="p-3 whitespace-nowrap">
                            {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                          </td>
                          <td className="p-3">{b.trek?.title || "-"}</td>
                          <td className="p-3 whitespace-nowrap">
                            {b.departure?.startDate
                              ? new Date(b.departure.startDate).toDateString()
                              : "-"}
                          </td>
                          <td className="p-3 font-medium whitespace-nowrap">{b.trekkingId}</td>
                          <td className="p-3">
                            <div className="font-medium">{b.customer?.fullName || "-"}</div>
                            <div className="text-xs text-gray-600">{b.customer?.email || ""}</div>
                            <div className="text-xs text-gray-600">{b.customer?.phone || ""}</div>
                          </td>
                          <td className="p-3">{b.numberOfSeats}</td>
                          <td className="p-3">₹{b.amountPaid}</td>
                          <td className="p-3">₹{b.amountDue}</td>
                          <td className="p-3">{b.status}</td>
                          <td className="p-3">{b.paymentStatus}</td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex gap-3">
                              {b.amountDue > 0 ? (
                                <button
                                  className="underline"
                                  onClick={() => sendSinglePaymentReminder(b.id)}
                                >
                                  Reminder
                                </button>
                              ) : null}
                              <button
                                className="underline text-red-600"
                                onClick={() => deleteBooking(b.id)}
                              >
                                Delete
                              </button>
                              {meQuery.data?.isMaster ? (
                                <button
                                  className="underline text-red-700"
                                  onClick={() => permanentlyDeleteBooking(b.id)}
                                >
                                  Permanent
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Customers" && (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Bookings</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {(customersQuery.data || []).map((c: any) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3 font-medium">{c.fullName}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone}</td>
                    <td className="p-3">{(c.bookings || []).length}</td>
                    <td className="p-3 whitespace-nowrap">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {customersQuery.data?.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-3 text-gray-600" colSpan={5}>
                      No customers found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Payments" && (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Booking</th>
                  <th className="text-left p-3">Stage</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {(paymentsQuery.data || []).map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3 font-medium">₹{p.amount}</td>
                    <td className="p-3 font-mono text-xs">{p.bookingId}</td>
                    <td className="p-3">{p.stage}</td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3">{p.provider}</td>
                    <td className="p-3 whitespace-nowrap">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
                {paymentsQuery.data?.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-3 text-gray-600" colSpan={6}>
                      No payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Email Logs" && (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">To</th>
                  <th className="text-left p-3">Subject</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {(emailLogsQuery.data || []).map((log: any) => (
                  <tr key={log.id} className="border-t align-top">
                    <td className="p-3">{log.to}</td>
                    <td className="p-3">{log.subject}</td>
                    <td className="p-3">{log.status}</td>
                    <td className="p-3 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 text-xs text-red-700">{log.error || ""}</td>
                  </tr>
                ))}
                {emailLogsQuery.data?.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-3 text-gray-600" colSpan={5}>
                      No email logs found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Admin Users" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="overflow-x-auto bg-white border rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminUsersQuery.data || []).map((a: any) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-3 font-medium">{a.email}</td>
                      <td className="p-3">{a.name || ""}</td>
                      <td className="p-3 whitespace-nowrap">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {meQuery.data?.isMaster ? (
                          <div className="flex gap-3">
                            <button className="underline" onClick={() => resetAdminPassword(a.id)}>
                              Reset Password
                            </button>
                            <button
                              className="underline text-red-600"
                              onClick={() => deleteAdminUser(a.id)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Master only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {adminUsersQuery.data?.length === 0 ? (
                    <tr className="border-t">
                      <td className="p-3 text-gray-600" colSpan={4}>
                        No admin users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="bg-white border p-4 rounded space-y-3">
              <h3 className="font-semibold">Add Admin User</h3>
              <p className="text-xs text-gray-600">
                Only the master admin (set via `MASTER_ADMIN_EMAIL` or `ADMIN_BOOTSTRAP_EMAIL`) can add/remove admins.
              </p>
              {meQuery.data?.isMaster ? (
                <AdminUserCreateForm onCreate={createAdminUser} />
              ) : (
                <div className="text-sm text-gray-700">
                  You are not the master admin. Set `MASTER_ADMIN_ID` (recommended) or `MASTER_ADMIN_EMAIL` on the
                  backend to enable this panel for your account.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Contact Messages" && (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {(contactMessagesQuery.data || []).map((m: any) => (
                  <tr key={m.id} className="border-t align-top">
                    <td className="p-3 whitespace-nowrap">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3">{m.email}</td>
                    <td className="p-3 whitespace-pre-wrap text-xs text-gray-700 max-w-[600px]">
                      {m.message}
                    </td>
                  </tr>
                ))}
                {contactMessagesQuery.data?.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-3 text-gray-600" colSpan={4}>
                      No contact messages yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Newsletter" && (
          <div className="overflow-x-auto bg-white border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Subscribed</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {(newsletterQuery.data || []).map((s: any) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 whitespace-nowrap">
                      {s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="p-3 font-medium">{s.email}</td>
                    <td className="p-3">{s.sourcePath || ""}</td>
                  </tr>
                ))}
                {newsletterQuery.data?.length === 0 ? (
                  <tr className="border-t">
                    <td className="p-3 text-gray-600" colSpan={3}>
                      No newsletter subscribers yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Page FAQs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border p-4 rounded">
              <h3 className="font-semibold mb-3">Existing FAQs</h3>
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left p-3">Page</th>
                      <th className="text-left p-3">Question</th>
                      <th className="text-left p-3">Order</th>
                      <th className="text-left p-3">Active</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(faqsQuery.data || []).map((f: any) => (
                      <tr key={f.id} className="border-t align-top">
                        <td className="p-3 whitespace-nowrap">{f.pageKey}</td>
                        <td className="p-3">
                          <div className="font-medium">{f.question}</div>
                          <div className="text-xs text-gray-600 mt-1 line-clamp-2">{f.answer}</div>
                        </td>
                        <td className="p-3">{f.sortOrder}</td>
                        <td className="p-3">{f.isActive ? "Yes" : "No"}</td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex gap-3">
                            <button onClick={() => setFaqForm(f)} className="underline">
                              Edit
                            </button>
                            <button onClick={() => deleteFaq(f.id)} className="underline text-red-600">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {faqsQuery.data?.length === 0 ? (
                      <tr className="border-t">
                        <td className="p-3 text-gray-600" colSpan={5}>
                          No FAQs found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
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
              <div className="overflow-x-auto bg-white border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left p-3">Code</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Value</th>
                      <th className="text-left p-3">Used</th>
                      <th className="text-left p-3">Active</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(couponsQuery.data || []).map((c: any) => (
                      <tr key={c.id} className="border-t">
                        <td className="p-3 font-medium">{c.code}</td>
                        <td className="p-3">{c.type}</td>
                        <td className="p-3">{c.value}</td>
                        <td className="p-3">{c.usedCount || 0}</td>
                        <td className="p-3">{c.isActive ? "Yes" : "No"}</td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex gap-3">
                            <button
                              onClick={() => toggleCouponStatus(c.id, c.isActive)}
                              className="underline"
                            >
                              {c.isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => shareCoupon(c.id, c.code)}
                              className="underline"
                            >
                              Share
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {couponsQuery.data?.length === 0 ? (
                      <tr className="border-t">
                        <td className="p-3 text-gray-600" colSpan={6}>
                          No coupons found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
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
          <div className="space-y-4">
            <div className="bg-white border p-5 rounded space-y-3 max-w-3xl">
              <h3 className="font-semibold text-lg">Trek Blogs (Sanity)</h3>
              <p className="text-sm text-gray-700">
                If you see <code>413 Entity Too Large</code> while saving a trek blog, itâ€™s because this legacy editor
                uploads images as base64 data URLs (very large requests). The recommended flow is to create Trek Blogs
                in Sanity Studio so images upload as separate assets.
              </p>
              <div className="flex gap-3 flex-wrap items-center">
                <a
                  href={sanityStudioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-maroon text-white px-4 py-2 rounded"
                >
                  Open Sanity Studio
                </a>
                <div className="text-xs text-gray-600">
                  Local: <code>cd reboot-india</code> then <code>npm run dev</code> (default{" "}
                  <code>http://localhost:3333</code>)
                </div>
              </div>
              <div className="text-sm text-gray-700">
                In Studio: create a <strong>Trek Blogs</strong> document and set <strong>Trek Slug</strong> exactly as
                your trek page slug (example: <code>/treks/kedarkantha</code> â†’ <code>kedarkantha</code>).
              </div>
            </div>

            <details className="bg-white border rounded">
              <summary className="cursor-pointer select-none px-4 py-3 font-semibold">
                Legacy Trek Blog Editor (Prisma)
              </summary>
              <div className="p-4">
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

              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left p-3">Title</th>
                      <th className="text-left p-3">Trek</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Featured</th>
                      <th className="text-left p-3">Updated</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(blogsQuery.data || []).map((b: any) => (
                      <tr key={b.id} className="border-t align-top">
                        <td className="p-3 font-medium">{b.title}</td>
                        <td className="p-3">{b.trek?.title || "-"}</td>
                        <td className="p-3">{b.status}</td>
                        <td className="p-3">{b.featured ? "Yes" : "No"}</td>
                        <td className="p-3 whitespace-nowrap">
                          {b.updatedAt ? new Date(b.updatedAt).toLocaleString() : "-"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex gap-3">
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
                        </td>
                      </tr>
                    ))}
                    {blogsQuery.data?.length === 0 ? (
                      <tr className="border-t">
                        <td className="p-3 text-gray-600" colSpan={6}>
                          No trek blogs found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
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
              <div className="text-xs text-gray-600 mb-1">Gallery (SVG upload or URLs one per line)</div>
              <input
                type="file"
                multiple
                accept=".svg,image/svg+xml"
                className="border p-2 w-full mb-2"
                onChange={async (e) => {
                  showError("Upload images via Sanity Studio (Trek Blogs). This legacy editor can trigger 413 errors.");
                  e.target.value = "";
                }}
              />
              <input
                className="border p-2 w-full mb-2"
                placeholder="Featured Image URL"
                value={blogForm.featuredImage}
                onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
              />
              <input
                type="file"
                accept=".svg,image/svg+xml"
                className="border p-2 w-full mb-2"
                onChange={async (e) => {
                  showError("Upload images via Sanity Studio (Trek Blogs). This legacy editor can trigger 413 errors.");
                  e.target.value = "";
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
              </div>
            </details>
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
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="text-left p-3">Reviewer</th>
                      <th className="text-left p-3">Trek</th>
                      <th className="text-left p-3">Rating</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Featured</th>
                      <th className="text-left p-3">Updated</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reviewsQuery.data || []).map((r: any) => (
                      <tr key={r.id} className="border-t align-top">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {r.reviewerPhotoUrl ? (
                              <img
                                src={r.reviewerPhotoUrl}
                                className="w-8 h-8 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full border" />
                            )}
                            <div className="font-medium">{r.reviewerName}</div>
                          </div>
                        </td>
                        <td className="p-3">{r.trek?.title || "-"}</td>
                        <td className="p-3">{r.rating}★</td>
                        <td className="p-3">{r.status}</td>
                        <td className="p-3">{r.featured ? "Yes" : "No"}</td>
                        <td className="p-3 whitespace-nowrap">
                          {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "-"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex gap-3">
                            <button onClick={() => loadReview(r)} className="underline">
                              Edit
                            </button>
                            <button onClick={() => setReviewStatus(r.id, "APPROVED")} className="underline">
                              Approve
                            </button>
                            <button onClick={() => setReviewStatus(r.id, "HIDDEN")} className="underline">
                              Hide
                            </button>
                            <button onClick={() => deleteReview(r.id)} className="underline text-red-600">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reviewsQuery.data?.length === 0 ? (
                      <tr className="border-t">
                        <td className="p-3 text-gray-600" colSpan={7}>
                          No reviews found.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
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
                if (!ensureSvgFile(file)) return;
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

