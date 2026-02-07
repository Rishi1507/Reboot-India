import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { LoadingButton } from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BookingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trekId: string;
  trekTitle: string;
  departureId?: string | number | null;
  pricePerSeat?: number | null;
};

export function BookingModal({
  open,
  onOpenChange,
  trekId,
  trekTitle,
  departureId,
  pricePerSeat,
}: BookingModalProps) {
  const [, setLocation] = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState<number | null>(null);

  const [acceptCancellation, setAcceptCancellation] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPhone("");
      setSeats(1);
      setCouponCode("");
      setDiscount(0);
      setFinalAmount(null);
      setCouponStatus(null);
      setError(null);
      setAcceptCancellation(false);
      setAcceptTerms(false);
    }
  }, [open]);

  const seatPrice = useMemo(
    () => Number(pricePerSeat ?? 0),
    [pricePerSeat]
  );

  const total = useMemo(
    () => Math.max(0, seats) * seatPrice,
    [seats, seatPrice]
  );

  const payable = finalAmount !== null ? finalAmount : total;

  async function applyCoupon() {
    if (!departureId || !couponCode) {
      setCouponStatus("Enter a coupon code");
      return;
    }

    try {
      setCouponStatus("Applying...");
      const res = await fetch("http://localhost:5000/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureId,
          seats,
          couponCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Invalid coupon");
      }

      setDiscount(data.discountAmount || 0);
      setFinalAmount(data.finalAmount);
      setCouponStatus("Coupon applied");
    } catch (err: any) {
      setDiscount(0);
      setFinalAmount(null);
      setCouponStatus(err?.message || "Coupon failed");
    }
  }

  async function handleSubmit() {
    if (!departureId) {
      setError("Please select a batch before booking.");
      return;
    }

    if (!name || !email || !seats) {
      setError("Please fill in required fields.");
      return;
    }

    if (!acceptCancellation || !acceptTerms) {
      setError("Please accept Cancellation Policy and Terms & Conditions.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trekId,
          departureId,
          userName: name,
          userEmail: email,
          userPhone: phone,
          numberOfSeats: seats,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Booking failed");
      }

      // ✅ FIXED: correct booking ID extraction
      const bookingId = data.id || data.bookingId;
      if (!bookingId) {
        console.error("Unexpected booking response:", data);
        throw new Error("Booking created but no ID returned");
      }

      const orderRes = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        }
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData?.error || "Failed to create order");
      }

      const { order } = orderData;
      if (!order?.id) {
        throw new Error("Order not returned");
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Reboot India",
        description: trekTitle,
        order_id: order.id,
        handler: async function (response: any) {
          await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              bookingId,
            }),
          });

          onOpenChange(false);
          setLocation(`/booking-success?bookingId=${bookingId}`);
        },
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: { color: "#7b1e1e" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {trekTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details to reserve your seats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Full name"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Phone number"
          />

          <input
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            min={1}
            type="number"
          />

          <div className="text-sm">Total: ₹{total}</div>
          {discount > 0 && (
            <div className="text-sm text-green-600">
              Discount: -₹{discount}
            </div>
          )}
          <div className="text-sm font-semibold">Payable: ₹{payable}</div>

          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="w-full border rounded px-3 py-2"
              placeholder="Coupon code"
            />
            <button onClick={applyCoupon} className="border px-3 rounded">
              Apply
            </button>
          </div>

          {couponStatus && (
            <div className="text-xs text-gray-500">{couponStatus}</div>
          )}

          {/* ✅ Cancellation Policy */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptCancellation}
              onChange={(e) => setAcceptCancellation(e.target.checked)}
            />
            <span>
              I accept the{" "}
              <a
                href="/cancellation-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Cancellation Policy
              </a>
            </span>
          </label>

          {/* ✅ Terms & Conditions */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <span>
              I accept the{" "}
              <a
                href="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Terms & Conditions
              </a>
            </span>
          </label>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <LoadingButton
            onClick={handleSubmit}
            loading={submitting}
            disabled={!acceptCancellation || !acceptTerms}
            className="bg-maroon hover:bg-forest text-white px-4 py-2 rounded"
          >
            Pay & Book
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
