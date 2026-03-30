import { useState } from "react";
import { Sparkles, Eye } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface BeforeAfterImage {
  id: number;
  before: string;
  after: string;
  title: string;
  description?: string;
}

// AI-generated placeholder images using placeholder services
// Replace these with your actual AI-generated images later
const beforeAfterImages: BeforeAfterImage[] = [
  {
    id: 1,
    before: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop", // Dirty car
    after: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop", // Clean car
    title: "Exterior Paint Correction",
    description: "Removed swirl marks and restored factory shine"
  },
  {
    id: 2,
    before: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop", // Messy interior
    after: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop", // Clean interior
    title: "Interior Deep Clean",
    description: "Full interior detailing with steam cleaning"
  },
  {
    id: 3,
    before: "https://images.unsplash.com/photo-1598966739654-5e9a252d8c4f?w=600&h=400&fit=crop", // Foggy headlight
    after: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop", // Clear headlight
    title: "Headlight Restoration",
    description: "Crystal clear visibility restored"
  },
  {
    id: 4,
    before: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop", // Dull paint
    after: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop", // Glossy finish
    title: "Ceramic Coating Application",
    description: "Long-lasting protection and hydrophobic finish"
  }
];

export const BeforeAfterSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();

  return (
    <section 
      ref={sectionRef}
      id="before-after" 
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div 
          ref={titleRef}
          className={`text-center mb-8 sm:mb-12 md:mb-16 transition-all duration-700 ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Our Work</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Before & After
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            See the transformation we deliver with every service
          </p>
        </div>

        {/* Photo Grid */}
        <div 
          ref={gridRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 transition-all duration-700 delay-200 ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {beforeAfterImages.map((image, idx) => (
            <div
              key={image.id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Before & After Side by Side */}
              <div className="grid grid-cols-2 gap-0">
                {/* Before Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={image.before}
                    alt={`Before: ${image.title}`}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                      BEFORE
                    </span>
                  </div>
                  {/* Overlay effect on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* After Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={image.after}
                    alt={`After: ${image.title}`}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                      AFTER
                    </span>
                  </div>
                  {/* Overlay effect on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-sm text-gray-500">{image.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Optional: View More Button */}
        <div className="text-center mt-10 sm:mt-12">
          <button 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg"
            onClick={() => window.location.href = '/gallery'}
          >
            <Eye className="w-4 h-4" />
            View More Transformations
          </button>
        </div>
      </div>
    </section>
  );
};