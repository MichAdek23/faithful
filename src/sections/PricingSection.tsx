import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Service {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_active: boolean;
}

export const PricingSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (data) {
      const parsedServices = data.map((service) => ({
        ...service,
        features: Array.isArray(service.features) ? service.features : [],
      }));
      setServices(parsedServices);
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className={`text-center mb-12 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Our Pricing</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Choose the perfect package for your vehicle
          </p>
        </div>
        {/* Promo Badges - Centered side by side */}

          <div className="animate-float flex justify-center gap-4 sm:gap-6 mb-8 flex-wrap">

          {/* First Time Offer Badge */}

            <div className="bg-[#002855] text-white rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-blue-400 transform hover:scale-105 transition-transform duration-300 inline-block text-center">
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-blue-100">
                First Time Offer
              </p>
              <p className="text-sm sm:text-base font-bold whitespace-nowrap">
                15% OFF your first wash
              </p>
            </div>

          {/* Wash 5 Pay for 4 Badge */}

            <div className="bg-[#002855] text-white rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 shadow-2xl border border-blue-400 transform hover:scale-105 transition-transform duration-300 inline-block text-center">
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-blue-100">
                Special Offer
              </p>
              <p className="text-sm sm:text-base font-bold">
                Wash 5 Cars, Pay for Only 4
              </p>
              <p className="text-[10px] sm:text-xs text-blue-100">
                One wash — completely free
              </p>
            </div>

          </div>


        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {services.map((service, index) => {
            const PricingCard = () => {
              const { ref, isVisible } = useScrollAnimation();
              return (
                <Card
                  key={service.id}
                  ref={ref}
                  className={`w-full max-w-[320px] bg-white rounded-xl shadow-lg transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
                    index === 1 ? "ring-2 ring-blue-600" : ""
                  } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="px-6 pt-6 pb-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-poppins font-semibold text-[#020a1f] text-xl">
                        {service.name}
                      </h3>
                      <p className="font-poppins font-bold text-[#020a1f] text-2xl">
                        from £{service.price}
                      </p>
                    </div>
                  </CardHeader>

                  <Separator className="mx-auto w-[90%]" />

                  <CardContent className="px-6 pt-6 pb-8">
                    <ul className="flex flex-col gap-3">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className={`flex items-start gap-2 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                          style={{ transitionDelay: `${(index * 150) + (featureIndex * 100)}ms` }}
                        >
                          <Check className="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="font-poppins text-gray-700 text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            };
            return <PricingCard key={service.id} />;
          })}
        </div>
      </div>
    </section>
  );
};
