import { Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const FooterSection = () => {
  const contactInfo = [
  {
    icon: Phone,
    text: "0747 305 2794",
    href: "tel:07473052794",
  },
  {
    icon: Mail,
    text: "faithfulautocare00@gmail.com",
    href: "mailto:faithfulautocare@gmail.com",
  },
];

  const companyLinks = ["About", "Company", "Blog", "Employee Handbook"];
  const legalLinks = ["Terms of service", "Privacy Policy", "Cookies Policy"];

  return (
    <footer className="relative w-full bg-[#002855] px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-4">
              <img
                src="/logo.png"
                alt="Faithful Auto Care Logo"
                className="w-auto h-auto max-w-[80px] sm:max-w-[150px] md:max-w-[180px] object-contain"
              />
              <h2 className="font-poppins font-bold text-white text-base sm:text-2xl md:text-3xl">
                FAITHFUL AUTO CARE
              </h2>
            </div>

            <p className="max-w-md font-poppins text-white text-xs sm:text-sm leading-6 sm:leading-7">
              We are a professional car care brand dedicated to delivering
              spotless results, premium detailing, and a seamless customer
              experience
            </p>

            <div className="flex flex-col gap-4 sm:gap-5">
              {contactInfo.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-start sm:items-center gap-3 sm:gap-4"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <contact.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>

                  <a
                    href={contact.href}
                    className="font-poppins text-white text-xs sm:text-sm hover:underline"
                  >
                    {contact.text}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col gap-2 sm:gap-3">
              <h3 className="font-poppins font-semibold text-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2">
                Company
              </h3>
              <nav className="flex flex-col gap-1.5 sm:gap-2">
                {companyLinks.map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="font-poppins text-white text-xs sm:text-sm hover:text-blue-300 transition"
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <h3 className="font-poppins font-semibold text-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2">
                Legal
              </h3>
              <nav className="flex flex-col gap-1.5 sm:gap-2">
                {legalLinks.map((link, index) => (
                  <a
                    key={index}
                    href="#"
                    className="font-poppins text-white text-xs sm:text-sm hover:text-blue-300 transition"
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 max-w-md">
          <h3 className="font-poppins font-bold text-white text-lg sm:text-xl mb-3 sm:mb-4">
            Newsletter
          </h3>
          <p className="font-poppins text-white text-xs sm:text-sm mb-4 sm:mb-6">
            Subscribe to our newsletter for the latest updates.
          </p>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Input
              type="email"
              placeholder="Your Email"
              className="bg-white text-gray-800 font-poppins rounded-xl px-3 sm:px-4 py-5 sm:py-6 h-auto text-sm sm:text-base"
            />
            <Button className="bg-[#020a1f] text-white font-poppins rounded-xl px-4 sm:px-6 py-5 sm:py-6 h-auto hover:bg-[#020a1f]/90 text-sm sm:text-base">
              Subscribe Now
            </Button>
          </div>
        </div>

        <Separator className="my-6 sm:my-8 bg-white/20" />

        <div className="flex justify-center text-white text-xs sm:text-sm">
          <p>© 2026 Faithful Auto Care. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

