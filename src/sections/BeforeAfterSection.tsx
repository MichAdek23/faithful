import { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
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
    before: "./public/BeforeAfter1.PNG", // Dirty car
    after: "./public/BeforeAfter2.PNG", // Clean car
    title: "Interior Deep Clean",
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
    before: "./public/BeforeAfter5.jpeg", // Foggy headlight
    after: "./public/BeforeAfter6.png", // Clear headlight
    title: "Headlight Restoration",
    description: "Crystal clear visibility restored"
  },
  
];

export const BeforeAfterSection = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Handle click zoom effect with sequence: black & white first, then zoom
  const handleCardClick = (card: HTMLDivElement | null) => {
    if (!card) return;
    
    // Step 1: Apply grayscale first
    card.style.transition = "filter 0.15s ease";
    card.style.filter = "grayscale(100%)";
    
    // Step 2: After grayscale is applied, add zoom effect
    setTimeout(() => {
      if (card) {
        card.style.transition = "filter 0.15s ease, transform 0.2s ease";
        card.style.transform = "scale(0.95)";
      }
    }, 150);
    
    // Step 3: Reset both effects
    setTimeout(() => {
      if (card) {
        card.style.transform = "scale(1)";
        
        // Remove grayscale after zoom returns
        setTimeout(() => {
          if (card) {
            card.style.filter = "grayscale(0%)";
            
            // Clean up transitions
            setTimeout(() => {
              if (card) {
                card.style.transition = "";
              }
            }, 150);
          }
        }, 200);
      }
    }, 350);
  };

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

        {/* Horizontal Scrolling Carousel - Images Only */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing pb-4"
          style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
        >
          {/* Duplicate images for seamless looping */}
          {[...beforeAfterImages, ...beforeAfterImages].map((image, idx) => (
            <div
              key={`${image.id}-${idx}`}
              ref={(el) => { cardRefs.current[idx] = el; }}
              onClick={(e) => handleCardClick(e.currentTarget)}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(e.currentTarget);
                }
              }}
            >
              {/* Single Image - Using 'after' as the main transformation image */}
              <div className="relative overflow-hidden">
                <img
                  src={image.after}
                  alt={`${image.title} transformation`}
                  className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
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