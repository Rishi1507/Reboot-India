import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CheckCircle, Mail, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function BookingSuccess() {
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/bookings/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          setVerified(true);
        } else {
          throw new Error("Payment verification failed");
        }
      } catch (error) {
        toast({
          title: "Verification Failed",
          description: "We couldn't verify your payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="h-4 w-32 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          {verified ? (
            <>
              <div className="mb-8 flex justify-center">
                <CheckCircle className="w-24 h-24 text-forest" />
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
                Booking Confirmed!
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your trek booking has been confirmed. A confirmation email with all the details
                has been sent to your registered email address. You'll also receive important
                information about what to bring and preparation tips.
              </p>

              <div className="bg-white border-2 border-forest/20 rounded-2xl p-8 mb-8">
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200 last:border-0">
                  <Mail className="w-6 h-6 text-forest flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-bold text-charcoal mb-2">Confirmation Email Sent</h3>
                    <p className="text-gray-600 text-sm">
                      Check your inbox and spam folder for the booking confirmation email with
                      trek details and preparation guides.
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="font-bold text-charcoal mb-2">What's Next?</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li>• Check your email for trek details and itinerary</li>
                    <li>• Prepare according to the guidelines provided</li>
                    <li>• Bring all required gear listed in the email</li>
                    <li>• Arrive 30 minutes early on the trek start date</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-maroon hover:bg-forest text-white px-8 py-3 font-bold flex items-center gap-2"
                  data-testid="button-home"
                >
                  <HomeIcon size={20} /> Back to Home
                </Button>
                <Button
                  onClick={() => setLocation("/treks")}
                  variant="outline"
                  className="border-maroon text-maroon hover:bg-maroon/10 px-8 py-3 font-bold"
                  data-testid="button-explore"
                >
                  Explore More Treks
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-4xl">⚠️</span>
                </div>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
                Payment Not Verified
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                We couldn't verify your payment. Please contact our support team for assistance.
              </p>

              <Button
                onClick={() => setLocation("/")}
                className="bg-maroon hover:bg-forest text-white px-8 py-3 font-bold"
                data-testid="button-retry"
              >
                Go Back Home
              </Button>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
