export async function startRazorpayPayment(bookingId: string) {
  // 1. Create order from backend
  const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  });

  const order = await orderRes.json();

  // 2. Open Razorpay Checkout
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: "INR",
    name: "Reboot India",
    description: "Trek Booking",
    order_id: order.id,

    handler: async function (response: any) {
      // 3. Verify payment
      await fetch("http://localhost:5000/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });

      window.location.href = "/booking-success";
    },

    theme: {
      color: "#7a1f2a",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}
