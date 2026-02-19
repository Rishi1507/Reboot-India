import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/PageHero";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CustomerBooking() {
  const queryBookingId = new URLSearchParams(window.location.search).get("bookingId") || "";
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [trekkingId, setTrekkingId] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(override?: { bookingId?: string; emailOrPhone?: string; trekkingId?: string }) {
    try {
      setLoading(true);
      setError("");
      const payload = {
        bookingId: override?.bookingId,
        emailOrPhone: override?.emailOrPhone ?? emailOrPhone,
        trekkingId: override?.trekkingId ?? trekkingId,
      };
      const res = await fetch(`${API}/api/bookings/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Lookup failed");
      setBookings(data.bookings || []);
    } catch (err: any) {
      setBookings([]);
      setError(err?.message || "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    if (!bookingId) return;

    lookup({ bookingId });
  }, []);

  async function payFullNow(bookingId: string) {
    const orderRes = await fetch(`${API}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, stage: "FULL" }),
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData?.error || "Failed to create payment order");

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.order.amount,
      currency: "INR",
      name: "Reboot India",
      description:
        orderData.fullPaymentDiscountApplied > 0
          ? "Complete pending payment (10% early-payment discount applied)"
          : "Complete pending payment",
      order_id: orderData.order.id,
      handler: async function (response: any) {
        await fetch(`${API}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            bookingId,
          }),
        });
        lookup();
      },
      theme: { color: "#7b1e1e" },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  async function cancelBooking(bookingId: string) {
    const confirmValue =
      (emailOrPhone || "").trim() ||
      prompt("Enter the email or phone used for this booking to confirm cancellation:") ||
      "";
    if (!confirmValue.trim()) return;
    if (!confirm("Cancel this booking? Advance paid will be added as credit for your next trek.")) {
      return;
    }

    const res = await fetch(`${API}/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone: confirmValue.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Cancellation failed");

    alert(
      `Booking cancelled. Credit added: ₹${data?.creditGranted ?? 0}. Available credit: ₹${data?.creditBalance ?? 0}.`,
    );
    lookup();
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Customer Booking | Reboot India"
        description="Lookup your trek booking with trekking ID and complete pending payment."
        canonical="https://rebootindia.co.in/customer/booking"
      />
      <Navigation />
      <PageHero
        title="My Booking"
        subtitle="View booking details and complete pending payment securely."
        eyebrow="Customer Portal"
      />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2">Find Your Booking</h1>
        <p className="text-gray-600 mb-6">
          {queryBookingId
            ? "Your booking was opened from a direct payment link. Complete payment below."
            : "Enter your email/phone or trekking ID to view booking details and complete payment."}
        </p>

        <div className="bg-white rounded-xl border p-4 max-w-2xl space-y-2">
          <input
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Email or phone"
          />
          <input
            value={trekkingId}
            onChange={(e) => setTrekkingId(e.target.value.toUpperCase())}
            className="border rounded px-3 py-2 w-full"
            placeholder="Trekking ID (optional)"
          />
          <button onClick={lookup} className="bg-maroon text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Searching..." : "Get Booking Details"}
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border rounded-xl p-4">
              <div className="font-semibold">{b.trek?.title}</div>
              <div className="text-sm text-gray-600">
                Trekking ID: {b.trekkingId} | Batch: {new Date(b.departure?.startDate).toDateString()}
              </div>
              <div className="text-sm mt-1">
                Total: ₹{b.finalAmount} | Paid: ₹{b.amountPaid} | Due: ₹{b.amountDue}
              </div>
              {b.creditUsed ? (
                <div className="text-xs text-gray-600 mt-1">Credit used: INR {b.creditUsed}</div>
              ) : null}
              {b.status === "CANCELLED" ? (
                <div className="mt-2 text-rose-700 text-sm font-medium">Cancelled</div>
              ) : null}
              {b.amountDue > 0 ? (
                <button
                  onClick={() => payFullNow(b.id)}
                  className="mt-3 bg-forest text-white px-4 py-2 rounded"
                >
                  Pay Full Amount Now
                </button>
              ) : (
                <div className="mt-2 text-green-700 text-sm font-medium">Fully paid</div>
              )}
              {b.status !== "CANCELLED" && b.paymentStatus !== "FULLY_PAID" ? (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="mt-3 border text-red-700 border-red-200 px-4 py-2 rounded"
                >
                  Cancel Booking
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
