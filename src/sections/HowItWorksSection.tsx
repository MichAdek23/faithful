import { Calendar, Wrench, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const HowItWorksSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  const steps = [
    {
      icon: Calendar,
      number: "01",
      title: "Book Online",
      description:
        "Schedule your appointment through our easy-to-use online booking system. Choose your preferred date, time, and service package.",
    },
    {
      icon: Wrench,
      number: "02",
      title: "We Wash",
      description:
        "Our expert team uses premium products and proven techniques to thoroughly clean, detail, and protect your vehicle.",
    },
    {
      icon: Sparkles,
      number: "03",
      title: "Enjoy the Shine",
      description:
        "Drive away with a spotless, refreshed vehicle that looks and feels brand new. Guaranteed satisfaction every time.",
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Three simple steps to a pristine vehicle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {steps.map((step, index) => {
            const StepCard = () => {
              const { ref, isVisible } = useScrollAnimation();
              return (
                <div
                  key={index}
                  ref={ref}
                  className={`relative flex flex-col items-center text-center p-6 sm:p-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="absolute top-0 right-2 sm:right-0 text-5xl sm:text-6xl font-bold text-gray-100">
                    {step.number}
                  </div>

                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 relative z-10 hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                    {step.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            };
            return <StepCard key={index} />;
          })}
        </div>
      </div>
    </section>
  );
};
