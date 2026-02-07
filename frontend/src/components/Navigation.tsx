import { Link, useLocation } from "wouter";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/treks", label: "Treks" },
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-offwhite/90 backdrop-blur-md py-4 border-gray-200 shadow-sm"
          : "bg-transparent py-6 border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <img
              src="/favicon.png"
              alt="Reboot India Logo"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className={clsx(
                "font-serif text-2xl font-bold tracking-tight transition-colors",
                scrolled ? "text-charcoal" : "text-charcoal md:text-white"
              )}
            >
              Reboot India
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={clsx(
                  "text-sm font-medium tracking-wide cursor-pointer transition-colors hover:text-maroon relative group",
                  location === link.href
                    ? "text-maroon"
                    : scrolled
                    ? "text-charcoal"
                    : "text-white/90"
                )}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-maroon transition-all group-hover:w-full" />
              </span>
            </Link>
          ))}
          <Link href="/treks">
            <button className="px-6 py-2.5 bg-maroon text-white text-sm font-medium rounded-full hover:bg-forest transition-all hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
              Start Planning
            </button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "md:hidden p-2 rounded-md transition-colors",
            scrolled ? "text-charcoal" : "text-charcoal md:text-white"
          )}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-offwhite border-b border-gray-200 p-4 md:hidden flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "block text-lg font-serif cursor-pointer py-2 px-4 rounded-lg hover:bg-gray-100",
                  location === link.href
                    ? "text-maroon font-semibold bg-gray-50"
                    : "text-charcoal"
                )}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <Link href="/treks">
            <button className="w-full mt-2 px-6 py-3 bg-maroon text-white text-base font-medium rounded-lg hover:bg-forest transition-colors">
              Start Planning
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

