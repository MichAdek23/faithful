import { MessageCircle, Phone, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full">
        <div className="mx-auto mt-4 sm:mt-6 max-w-7xl px-3 sm:px-6">
          <div className="flex h-16 sm:h-14 items-center justify-between rounded-full bg-[#D6EAF84D] backdrop-blur-md px-4 sm:px-6 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/LogoBlackie.png"
                alt="Faithful Auto Care Logo"
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-sm sm:text-lg text-blue-900 font-semibold uppercase tracking-wide hidden sm:inline">
                Faithful Auto Care
              </span>
              <span className="text-xs sm:text-lg text-blue-900 font-semibold uppercase tracking-wide sm:hidden">
                Faithful
              </span>
            </div>

            <ul className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-700">
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => scrollToSection("hero")}
              >
                Home
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => scrollToSection("about")}
              >
                About Us
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => scrollToSection("services")}
              >
                Services
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => scrollToSection("process")}
              >
                Process
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => scrollToSection("pricing")}
              >
                Price
              </li>
              <li
                className="cursor-pointer hover:text-blue-600 transition"
                onClick={() => navigate("/view-bookings")}
              >
                My Bookings
              </li>
            </ul>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                as="a"
                href="https://wa.me/447473052794"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4 mr-1" /> Chat us
              </Button>

              <Button
                as="a"
                href="tel:07473052794"
                className="hidden sm:flex rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Phone className="w-4 h-4 mr-1" /> Call
              </Button>

              <Button
                className="sm:hidden rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Button
                className="hidden lg:hidden md:flex rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-24 sm:top-20 z-40">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative mx-3 sm:mx-6 mt-2 rounded-3xl bg-white shadow-2xl overflow-hidden">
              <ul className="flex flex-col text-base font-medium">
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => scrollToSection("hero")}
                >
                  Home
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => scrollToSection("about")}
                >
                  About Us
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => scrollToSection("services")}
                >
                  Services
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => scrollToSection("process")}
                >
                  Process
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => scrollToSection("pricing")}
                >
                  Price
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 transition px-6 py-4 border-b border-gray-100"
                  onClick={() => {
                    navigate("/view-bookings");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  My Bookings
                </li>
                <li className="px-6 py-4 space-y-3">
                  <Button
                    as="a"
                    href="https://wa.me/447473052794"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat with us
                  </Button>

                  <Button
                    as="a"
                    href="tel:07473052794"
                    className="w-full rounded-full bg-blue-500 px-4 py-3 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    <Phone className="w-4 h-4 mr-2" /> Call us
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        )}
      </nav>

      <section
        id="hero"
        className="relative flex min-h-screen w-full items-center overflow-hidden"
      >
        <img
          src="/LandingPage1.png"
          alt="Car wash background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10 py-32">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg opacity-0 animate-slideInLeft">
              <span className="block">Professional shine.</span>
              <span className="block mt-3">Exceptional care.</span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl font-medium leading-relaxed text-white/95 mb-8 max-w-lg drop-shadow-md opacity-0 animate-slideInLeft animation-delay-200">
              Where every wash restores that brand new feeling, leaving your car
              spotless, refreshed, ready to own the road with confidence.
            </p>

            <Button
              onClick={() => navigate('/book-now')}
              className="rounded-lg bg-blue-600 px-8 py-6 text-base font-semibold hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 opacity-0 animate-slideInLeft animation-delay-400"
            >
              Book Now
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};