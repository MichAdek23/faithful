import { Trophy, Clock, Handshake, Recycle } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Trophy,
      title: "Quality Focused",
      description: "premium products, and a spotless finish every single time.",
    },
    {
      icon: Clock,
      title: "Rapid & Reliable",
      description: "fast, efficient service without compromise on quality",
    },
    {
      icon: Handshake,
      title: "Customer Experience",
      description: "refreshing care that makes every visit worth it.",
    },
    {
      icon: Recycle,
      title: "Eco-Conscious",
      description: "plant-based soaps and 80% water recycling",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center gap-2 sm:gap-3 rounded-xl bg-[#4FA3E3] p-5 sm:p-6 text-center text-white min-h-[160px] sm:min-h-[180px] hover:bg-[#3d8cc9] transition-all hover:scale-105 opacity-0 animate-slideUp animation-delay-${index * 200}`}
            >
              <feature.icon className="w-7 h-7 sm:w-8 sm:h-8" />
              <h3 className="text-sm sm:text-base font-bold">{feature.title}</h3>
              <p className="text-xs sm:text-sm opacity-90">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
