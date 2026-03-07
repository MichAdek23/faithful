import { Droplets, Car, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ServicesSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  const services = [
    {
      icon: Droplets,
      title: "Basic Refresh Package",
      description:
        "A quick, focused clean — interior OR exterior. We vacuum, wipe the dashboard, console and doors, or wash, rinse and polish the exterior including windows and alloy wheels. From £35.",
      image:
        "https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Car,
      title: "Premium Package",
      description:
        "Our most popular full interior and exterior valet. Seat shampooing, window cleaning, dashboard wipe, exterior wash, shampoo, polish and alloy wheel cleaning. From £70.",
      image:
        "https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Sparkles,
      title: "Ultimate Package",
      description:
        "Our most comprehensive deep clean to return your vehicle to showroom standard. Includes everything in Premium plus deep seat cleaning, stain remover treatment and more. From £155.",
      image:
        "https://images.pexels.com/photos/5288707/pexels-photo-5288707.jpeg?auto=compress&cs=tinysrgb&w=600",
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">

        <div
          ref={titleRef}
          className={`text-center mb-12 transition-all duration-700 ${
            titleVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Our Services
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Professional car care services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const ServiceCard = () => {
              const { ref, isVisible } = useScrollAnimation();

              return (
                <div
                  ref={ref}
                  className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700 hover:scale-105 ${
                    isVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-48 sm:h-56">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
                      {service.title}
                    </h3>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            };

            return <ServiceCard key={index} />;
          })}
        </div>
      </div>
    </section>
  );
};