export function WhatsAppWidget() {
  const phone = "919936860769";
  const text = encodeURIComponent("Hello, I want to connect");
  const href = `https://wa.me/${phone}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2 hover:bg-emerald-600 transition-colors"
      aria-label="Chat on WhatsApp"
    >
      <span className="font-semibold text-sm">WhatsApp</span>
    </a>
  );
}
