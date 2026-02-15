import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/PageHero";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Refund Policy | Reboot India"
        description="Understand Reboot India's refund and cancellation policy for trek bookings."
        canonical="https://rebootindia.co.in/refund-policy"
      />
      <Navigation />
      <PageHero
        title="Refund Policy"
        subtitle="Clear and fair cancellation terms for every trek booking."
        eyebrow="Legal"
      />

      <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
        <p className="text-gray-600 mt-4">
          Our refund policy is designed to be fair and transparent. Please read
          carefully before booking.
        </p>

        <div className="mt-10 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Cancellation Window
            </h2>
            <p className="mt-2">
              Cancellations made 30 days or more before the trek start date are
              eligible for a full refund minus processing fees.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Partial Refunds
            </h2>
            <p className="mt-2">
              Cancellations made 15-29 days before the trek start date are
              eligible for a 50% refund.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Non-Refundable Window
            </h2>
            <p className="mt-2">
              Cancellations within 14 days of the trek start date are not
              refundable due to logistical commitments.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Trek Changes
            </h2>
            <p className="mt-2">
              You can request a one-time reschedule to another batch (subject to
              availability) up to 10 days before the trek.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Contact
            </h2>
            <p className="mt-2">
              For refund questions, contact support@rebootindia.co.in.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
