import { Clock, Award, Shield, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const WhyChooseUsSection = () => {
  const navigate = useNavigate();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  const reasons = [
    {
      icon: Clock,
      title: "Convenience",
      description:
        "Flexible scheduling, quick turnaround times, and multiple service locations to fit your busy lifestyle.",
    },
    {
      icon: Award,
      title: "Quality",
      description:
        "Premium products, skilled technicians, and attention to detail ensure your vehicle receives the best care possible.",
    },
    {
      icon: Shield,
      title: "Consistency",
      description:
        "Reliable service every single time. Our proven processes deliver consistent, exceptional results you can count on.",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        <div ref={titleRef} className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our commitment to excellence
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div ref={imageRef} className={`relative w-full md:w-1/2 flex justify-center transition-all duration-700 delay-200 ${imageVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="absolute rounded-xl z-0 w-[280px] sm:w-[391px] h-[280px] sm:h-[383px] bg-[#A8D4F5] rotate-[8deg] transform"></div>

            <img
              src="https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Professional Car Detailing"
              className="relative z-10 w-full max-w-[280px] sm:max-w-[383px] h-[270px] sm:h-[366px] object-cover rounded-xl shadow-lg"
            />

            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 w-[120px] sm:w-[136px] h-[60px] sm:h-[67px] bg-[#A8D4F5] rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-black shadow-md animate-float">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-left leading-tight text-[10px] sm:text-xs">
                100%<br />
                Customer<br />
                Satisfaction
              </span>
            </div>
          </div>

          <div ref={contentRef} className={`w-full md:w-1/2 transition-all duration-700 delay-300 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <h2 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl font-semibold mb-6">
              Excellence in Every Detail
            </h2>

            <div className="space-y-6 mb-8">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className={`flex gap-4 transition-all duration-500 ${contentVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                  style={{ transitionDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                    <reason.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate('/book-now')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg hover:scale-105 transition-transform duration-300"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
