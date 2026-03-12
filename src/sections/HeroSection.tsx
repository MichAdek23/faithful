import { MessageCircle, Phone, Menu, X, MapPin } from "lucide-react";
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
              <span className="text-sm sm:text-lg text-blue-900 font-semibold uppercase tracking-wide">
                Faithful Auto Care
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
                onClick={() =>
                  window.open("https://wa.me/447473052794", "_blank")
                }
                className="hidden lg:flex rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4 mr-1" /> Chat us
              </Button>

              <Button
                onClick={() => (window.location.href = "tel:07473052794")}
                className="hidden lg:flex rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Phone className="w-4 h-4 mr-1" /> Call
              </Button>

              <Button
                className="lg:hidden rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
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
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => scrollToSection("hero")}
                >
                  Home
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => scrollToSection("about")}
                >
                  About Us
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => scrollToSection("services")}
                >
                  Services
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => scrollToSection("process")}
                >
                  Process
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => scrollToSection("pricing")}
                >
                  Price
                </li>
                <li
                  className="cursor-pointer hover:bg-blue-50 px-6 py-4 border-b"
                  onClick={() => {
                    navigate("/view-bookings");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  My Bookings
                </li>

                <li className="px-6 py-4 space-y-3">
                  <Button
                    onClick={() =>
                      window.open("https://wa.me/447473052794", "_blank")
                    }
                    className="w-full rounded-full bg-blue-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat with us
                  </Button>

                  <Button
                    onClick={() => (window.location.href = "tel:07473052794")}
                    className="w-full rounded-full bg-blue-500 text-white"
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
        className="relative flex min-h-[100dvh] w-full items-center overflow-hidden"
      >
        <img
          src="/LandingPage1.png"
          alt="Car wash background"
          className="absolute inset-0 w-full h-full object-cover md:blur-[2px] blur-md lg:blur-0"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent md:from-black/70 md:via-black/40 lg:from-black/40 lg:via-transparent"></div>

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 xl:px-28 py-24 md:py-32">
          <div className="max-w-4xl text-white">

            {/* Updated Headline - Now showing serving area in two lines */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-lg opacity-0 animate-slideInLeft">
              <span className="block">Serving Bedfordshire,</span>
              <span className="block mt-2">Hertfordshire & Surrounding Areas</span>
            </h1>

            {/* Paragraph */}
            <p className="text-base md:text-lg lg:text-xl font-medium leading-relaxed text-white/95 mb-8 max-w-lg drop-shadow-md opacity-0 animate-slideInLeft animation-delay-200">
              Where every wash restores that brand new feeling, leaving your car
              spotless, refreshed, ready to own the road with confidence.
            </p>

            {/* Serving Area Badge - Now positioned below the CTA section */}
            <div className="opacity-0 animate-slideInLeft animation-delay-400">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 text-xs sm:text-sm md:text-base font-medium text-white shadow-md">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                Mobile detailing at your location
              </span>
            </div><br></br>

            {/* CTA Section - Book Now and Offer Badge together */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 opacity-0 animate-slideInLeft animation-delay-300">
              {/* Book Now Button */}
              <Button
                onClick={() => navigate("/book-now")}
                className="rounded-lg bg-blue-600 px-8 py-6 text-base font-semibold hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Book Now
              </Button>

              {/* First Time Offer Badge - Now with floating animation and smaller on mobile */}
              <div className="animate-float">
                <div className="bg-blue-600 text-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-2xl border border-blue-400 transform hover:scale-105 transition-transform duration-300">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-blue-100">
                    First Time Offer
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">
                    Get 15% OFF your first wash
                  </p>
                </div>
              </div>
            </div>


          </div>
        </div>
              
      </section>

      {/* Add the floating animation to your global CSS or in a style tag */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </>
  );
};