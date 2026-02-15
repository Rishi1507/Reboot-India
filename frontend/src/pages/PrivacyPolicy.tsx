import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/PageHero";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Privacy Policy | Reboot India"
        description="Learn how Reboot India collects, uses, and protects your personal information."
        canonical="https://rebootindia.co.in/privacy-policy"
      />
      <Navigation />
      <PageHero
        title="Privacy Policy"
        subtitle="How Reboot India collects, uses, and protects your data."
        eyebrow="Legal"
      />

      <div className="container mx-auto px-4 md:px-6 py-16 max-w-4xl">
        <p className="text-gray-600 mt-4">
          We respect your privacy and are committed to protecting your personal
          data.
        </p>

        <div className="mt-10 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Information We Collect
            </h2>
            <p className="mt-2">
              We collect information you provide when booking a trek, subscribing
              to our newsletter, or contacting support. This may include your
              name, email, phone number, and booking details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              How We Use Your Information
            </h2>
            <p className="mt-2">
              We use your information to manage bookings, send confirmations,
              provide customer support, and share relevant updates with your
              consent.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Data Security
            </h2>
            <p className="mt-2">
              We use industry-standard security measures to protect your data.
              Only authorized personnel have access to your information.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Your Rights
            </h2>
            <p className="mt-2">
              You may request access, correction, or deletion of your personal
              data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Contact
            </h2>
            <p className="mt-2">
              If you have questions about this policy, reach out at
              support@rebootindia.co.in.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
