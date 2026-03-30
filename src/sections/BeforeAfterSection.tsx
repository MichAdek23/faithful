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

const beforeAfterImages: BeforeAfterImage[] = [
  {
    id: 1,
    before: "/before-after/before-1.jpg",
    after: "/before-after/after-1.jpg",
    title: "Exterior Paint Correction",
    description: "Removed swirl marks and restored factory shine"
  },
  {
    id: 2,
    before: "/before-after/before-2.jpg",
    after: "/before-after/after-2.jpg",
    title: "Interior Deep Clean",
    description: "Full interior detailing with steam cleaning"
  },
  {
    id: 3,
    before: "/before-after/before-3.jpg",
    after: "/before-after/after-3.jpg",
    title: "Headlight Restoration",
    description: "Crystal clear visibility restored"
  },
  {
    id: 4,
    before: "/before-after/before-4.jpg",
    after: "/before-after/after-4.jpg",
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
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                      BEFORE
                    </span>
                  </div>
                </div>

                {/* After Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={image.after}
                    alt={`After: ${image.title}`}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                      AFTER
                    </span>
                  </div>
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
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all hover:scale-105"
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