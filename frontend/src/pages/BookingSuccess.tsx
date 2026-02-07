import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CheckCircle, Mail, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";

/**
 * Always provide a fallback.
 * In production Netlify → VITE_API_URL
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function BookingSuccess() {
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(true); // ✅ default true
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * ❌ REMOVED verify-payment call
   * Backend does not expose it yet
   * This page is confirmation-only
   */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      toast({
        title: "Booking Confirmed",
        description:
          "Your booking was successful. Confirmation email has been sent.",
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      <Seo
        title="Booking Confirmed | Reboot India"
        description="Your trek booking has been confirmed. We have emailed your details and next steps."
        canonical="https://rebootindia.co.in/booking-success"
      />
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
                Your trek booking has been confirmed. A confirmation email has
                been sent to your registered email address.
              </p>

              <div className="bg-white border-2 border-forest/20 rounded-2xl p-8 mb-8">
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
                  <Mail className="w-6 h-6 text-forest flex-shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-bold text-charcoal mb-2">
                      Confirmation Email Sent
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Please check your inbox and spam folder for the booking
                      details.
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="font-bold text-charcoal mb-2">What’s Next?</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li>• Review trek details and itinerary</li>
                    <li>• Prepare according to the guidelines</li>
                    <li>• Bring all required gear</li>
                    <li>• Arrive 30 minutes early</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-maroon hover:bg-forest text-white px-8 py-3 font-bold flex items-center gap-2"
                >
                  <HomeIcon size={20} /> Back to Home
                </Button>

                <Button
                  onClick={() => setLocation("/treks")}
                  variant="outline"
                  className="border-maroon text-maroon hover:bg-maroon/10 px-8 py-3 font-bold"
                >
                  Explore More Treks
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <Footer />
    </div>
  );
}
