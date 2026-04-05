import { useRef, useEffect } from "react";
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
    before: "./public/BeforeAfter1.PNG", // Dirty car
    after: "./public/BeforeAfter2.PNG", // Clean car
    title: "Exterior Paint Correction",
    description: "Removed swirl marks and restored factory shine"
  },
  {
    id: 2,
    before: "./public/BeforeAfter3.PNG", // Messy interior
    after: "./public/BeforeAfter4.PNG", // Clean interior
    title: "Interior Deep Clean",
    description: "Full interior detailing with steam cleaning"
  },
  {
    id: 3,
    before: ".public/BeforeAfter5.jpeg", // Foggy headlight
    after: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&h=400&fit=crop", // Clear headlight
    title: "Headlight Restoration",
    description: "Crystal clear visibility restored"
  },
  
];

export const BeforeAfterSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame (approx 30px per second at 60fps)

    const scroll = () => {
      if (!container) return;
      scrollPosition += scrollSpeed;
      
      // Reset when reaching the end for infinite loop effect
      if (scrollPosition >= container.scrollWidth - container.clientWidth) {
        scrollPosition = 0;
      }
      
      container.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="before-after" 
      className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden"
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

        {/* Horizontal Scrolling Carousel - One Image Per Card */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4"
          style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
        >
          {/* Duplicate images for seamless looping */}
          {[...beforeAfterImages, ...beforeAfterImages].map((image, idx) => (
            <div
              key={`${image.id}-${idx}`}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px]"
            >
              {/* Single Image - Using 'after' as the main transformation image */}
              <div className="relative overflow-hidden">
                <img
                  src={image.after}
                  alt={`${image.title} transformation`}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Optional subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};