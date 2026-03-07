import { Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const AboutSection = () => {
  const navigate = useNavigate();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div ref={titleRef} className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">About Us</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in professional car care
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div ref={imageRef} className={`relative w-full md:w-1/2 flex justify-center transition-all duration-700 delay-200 ${imageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="absolute rounded-xl z-0 w-[280px] sm:w-[391px] h-[280px] sm:h-[383px] bg-[#A8D4F5] rotate-[8deg] transform"></div>

            <img
              src="/washing.jpg"
              alt="Car Wash"
              className="relative z-10 w-full max-w-[280px] sm:max-w-[383px] h-[270px] sm:h-[366px] object-cover rounded-xl shadow-lg"
            />

            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 w-[120px] sm:w-[136px] h-[60px] sm:h-[67px] bg-[#A8D4F5] rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-black shadow-md animate-float">
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-left leading-tight text-[10px] sm:text-xs">
                21 years of<br />
                quality<br />
                service
              </span>
            </div>
          </div>

          <div ref={contentRef} className={`w-full md:w-1/2 transition-all duration-700 delay-300 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <h2 className="text-gray-800 text-2xl md:text-4xl font-semibold mb-4">
              Professional Car Care You Can Trust
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              At Faithful Auto Care, we bring the luxury of professional car detailing straight to you. We don’t only wash we care. Our mobile service is all about convenience: we come to your home, office, or any location you choose, offering a complete, on-the-go wash and detailing service at your convenience. From a quick exterior shine to a full interior deep clean, every step is done with precision. We value your time, so we come to you no hassle, no waiting, just top-quality care wherever you are. At Faithful Auto Care, your car is in trusted hands because we don’t only wash, we care.
            </p>
            <Button
              onClick={() => navigate('/book-now')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg hover:scale-105 transition-transform"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
