import { Users, Car, Award, Heart } from "lucide-react";

export const StatisticsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "100+",
      label: "Happy Customers",
    },
    {
      icon: Car,
      number: "100+",
      label: "Cars Washed",
    },
    {
      icon: Award,
      number: "3",
      label: "Years Experience",
    },
    {
      icon: Heart,
      number: "98%",
      label: "Satisfaction Rate",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#002855]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className={`text-center opacity-0 animate-scaleIn animation-delay-${(index + 1) * 200}`}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                {stat.number}
              </h3>

              <p className="text-gray-300 text-xs sm:text-sm font-medium px-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
