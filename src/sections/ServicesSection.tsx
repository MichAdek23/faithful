import { Droplets, Car, Sparkles, Shield, RefreshCcw } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ServicesSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  const services = [
    {
      icon: Droplets,
      title: "Basic Package",
      description:
        "A quick and affordable refresh. Choose between interior or exterior cleaning. Interior includes vacuum and surface wipe, while exterior covers wash, polish, windows and alloy wheels. Includes paint sealant. From £25.",
      image:
        "https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Car,
      title: "Standard Package",
      description:
        "A complete interior and exterior clean for everyday freshness. Includes vacuuming, dashboard wipe, window cleaning and full exterior wash. Ideal for routine maintenance. From £40.",
      image:
        "https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Shield,
      title: "Premium Package",
      description:
        "Enhanced cleaning with added paint protection. Includes everything in the Standard Package plus a protective sealant to preserve your vehicle’s shine and finish. From £55.",
      image:
        "https://images.pexels.com/photos/3807316/pexels-photo-3807316.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Sparkles,
      title: "Ultimate Package",
      description:
        "Our most comprehensive deep clean. Includes full interior and exterior detailing, stain removal, and deep surface cleaning to restore your car to near showroom condition. From £120.",
      image:
        "https://images.pexels.com/photos/5288707/pexels-photo-5288707.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: RefreshCcw,
      title: "Maintenance Plan",
      description:
        "Monthly premium care to keep your car in top condition all year. Includes full interior and exterior cleaning with paint protection. Requires one Premium Package before signup. £45/month.",
      image:
        "https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  return (
    <section id="services" className="py-16 sm:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Title */}
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

        {/* Grid */}
        <div className="grid gap-6 sm:gap-8 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] justify-items-center">
          {services.map((service, index) => {
            const ServiceCard = () => {
              const { ref, isVisible } = useScrollAnimation();

              return (
                <div
                  ref={ref}
                  className={`w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700 hover:scale-105 ${
                    isVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
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

                  {/* Content */}
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