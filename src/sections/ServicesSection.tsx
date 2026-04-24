import { Droplets, Car, Sparkles, Shield, RefreshCcw, Truck, Wrench } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const ServicesSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  const services = [
    {
      icon: Droplets,
      title: "Basic Package",
      description:
        "A quick and affordable refresh. Choose between interior or exterior cleaning. Interior includes vacuum and surface wipe, while exterior covers wash, polish, windows and alloy wheels. Includes paint sealant. From £15.",
      image:
        "https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      icon: Car,
      title: "Standard Package",
      description:
        "A complete interior and exterior clean for everyday freshness. Includes vacuuming, dashboard wipe, window cleaning and full exterior wash. Ideal for routine maintenance. From £32.",
      image: "/9.jpeg",
    },
    {
      icon: Shield,
      title: "Premium Package",
      description:
        "Enhanced cleaning with added paint protection. Includes everything in the Standard Package plus a protective sealant to preserve your vehicle's shine and finish. From £45.",
      image: "/interior.jpeg",
    },
    {
      icon: Sparkles,
      title: "Ultimate Package",
      description:
        "Our most comprehensive deep clean. Includes full interior and exterior detailing, stain removal, and deep surface cleaning to restore your car to near showroom condition. From £80.",
      image: "/8.jpeg",
    },
    {
      icon: RefreshCcw,
      title: "Monthly Maintenance Plan",
      description:
        "Monthly premium care to keep your car in top condition all year. Includes full interior and exterior cleaning with paint protection. Requires one Premium Package before signup. £40/month.",
      image: "/2.jpeg",
    },
    {
      icon: Truck,
      title: "Small Van Service",
      description:
        "Perfect for compact vans and small commercial vehicles. Full exterior wash and hand dry, interior vacuum and deep clean, dashboard cleaning, windows inside and out, door jambs, tyre dressing and wheel cleaning. From £50.",
      image: "/van1.jpg",
    },
    {
      icon: Truck,
      title: "Medium Van Service",
      description:
        "Ideal for standard transit vans and medium commercial vehicles. Complete interior and exterior cleaning with special attention to cargo areas and high-use zones. From £65.",
      image: "/van2.jpg",
    },
    {
      icon: Truck,
      title: "Large Van Service",
      description:
        "Comprehensive service for large vans and high-roof vehicles. Deep cleaning of entire vehicle including roof areas, cargo space sanitization, and full exterior protection. From £80.",
      image: "/van3.jpg",
    },
    {
      icon: Wrench,
      title: "Engine Detailing",
      description:
        "Professional engine bay restoration and protection. Thorough degreasing of engine surfaces, removal of grime and dust, protective dressings applied for a refreshed, like-new engine bay. From £25.",
      image: "/Engine1.jpg",
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
            Professional car, van, and engine care services tailored to your needs
          </p>
        </div>

        {/* Grid - Responsive grid that automatically adjusts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const ServiceCard = () => {
              const { ref, isVisible } = useScrollAnimation();

              return (
                <div
                  ref={ref}
                  className={`w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-700 hover:scale-105 flex flex-col h-full ${
                    isVisible
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-52 flex-shrink-0">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=600";
                      }}
                    />
                    <div className="absolute bottom-4 right-4 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                    
                    {/* Price hint for Van and Engine services */}
                    {(service.title.includes("Van") || service.title.includes("Engine")) && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          {service.title.includes("Van")}
                        </p>
                      </div>
                    )}
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