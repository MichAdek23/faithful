import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  category: "van" | "engine" | "other";
  popular?: boolean;
}

const services: Service[] = [
  // Van Services
  {
    id: "small-van",
    name: "Small Van",
    price: 50,
    description: "Perfect for compact vans and small commercial vehicles",
    category: "van",
    features: [
      "Full exterior wash and hand dry",
      "Interior vacuum and deep clean",
      "Dashboard and console cleaning",
      "Window cleaning inside and out",
      "Door jambs and hinges cleaned",
      "Tyre dressing and wheel cleaning",
    ],
  },
  {
    id: "medium-van",
    name: "Medium Van",
    price: 65,
    description: "Ideal for standard transit vans and medium commercial vehicles",
    category: "van",
    popular: true,
    features: [
      "Full exterior wash and hand dry",
      "Interior vacuum and deep clean",
      "Dashboard and console cleaning",
      "Window cleaning inside and out",
      "Door jambs and hinges cleaned",
      "Tyre dressing and wheel cleaning",
    ],
  },
  {
    id: "large-van",
    name: "Large Van",
    price: 80,
    description: "Comprehensive service for large vans and high-roof vehicles",
    category: "van",
    features: [
      "Full exterior wash and hand dry",
      "Interior vacuum and deep clean",
      "Dashboard and console cleaning",
      "Window cleaning inside and out",
      "Door jambs and hinges cleaned",
      "Tyre dressing and wheel cleaning",
    ],
  },
  // Engine Detailing Service
  {
    id: "engine-detailing",
    name: "Engine Detailing",
    price: 25,
    description: "Professional engine bay restoration and protection",
    category: "engine",
    features: [
      "Thorough degreasing of engine surfaces",
      "Removal of grime and dust",
      "Protective dressings applied",
      "A refreshed, like-new engine bay",
    ],
  },
];

// Helper to get services by category
const getServicesByCategory = (category: Service["category"]) => 
  services.filter(service => service.category === category);

export const VanPricingSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  
  const vanServices = getServicesByCategory("van");
  const engineServices = getServicesByCategory("engine");
  const hasEngineServices = engineServices.length > 0;

  const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
    const { ref, isVisible } = useScrollAnimation();
    
    return (
      <Card
        ref={ref}
        className={`w-full max-w-[340px] bg-white rounded-xl shadow-lg transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
          service.popular ? "ring-2 ring-blue-600" : ""
        } ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-semibold text-[#020a1f] text-xl">
                {service.name}
              </h3>
              {service.popular && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Most Popular
                </span>
              )}
            </div>
            <p className="font-poppins text-gray-500 text-sm">
              {service.description}
            </p>
            <p className="font-poppins font-bold text-[#020a1f] text-2xl mt-2">
              from £{service.price}
            </p>
          </div>
        </CardHeader>

        <Separator className="mx-auto w-[90%]" />

        <CardContent className="px-6 pt-6 pb-8">
          <p className="font-poppins font-medium text-gray-800 text-sm mb-3">
            What's included:
          </p>
          <ul className="flex flex-col gap-3">
            {service.features.map((feature, featureIndex) => (
              <li
                key={featureIndex}
                className={`flex items-start gap-2 transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
                style={{
                  transitionDelay: `${index * 150 + featureIndex * 75}ms`,
                }}
              >
                <Check className="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" />
                <span className="font-poppins text-gray-700 text-sm">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Contact us for custom fleet packages and recurring service discounts
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="van-pricing" className="py-16 sm:py-20 bg-white">
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
            Professional cleaning solutions for commercial vans and specialised vehicle services
          </p>
        </div>

        {/* Van Services Section */}
        {vanServices.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Van Services
              </h3>
              <p className="text-gray-600">
                Professional cleaning for commercial and private vans of all sizes
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {vanServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Engine Services Section */}
        {hasEngineServices && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Engine Services
              </h3>
              <p className="text-gray-600">
                Specialised engine bay cleaning and protection
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {engineServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};