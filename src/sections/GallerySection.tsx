import { useRef, useEffect, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

// Sample images - replace these with your actual image URLs
const galleryImages = [
  {
    id: 1,
    url: "/displaytires.jpeg",
    alt: "Car detailing service 1",
  },
  {
    id: 2,
    url: "/ExteriorDisplay.jpeg",
    alt: "Car detailing service 2",
  },
  {
    id: 3,
    url: "InteriorSection.jpeg",
    alt: "Car detailing service 3",
  },
  {
    id: 4,
    url: "displaytires2.jpeg",
    alt: "Car detailing service 4",
  },
  {
    id: 5,
    url: "/BeforeAfter2.PNG",
    alt: "Car detailing service 5",
  },
  {
    id: 6,
    url: "/SingleEngineHD.jpeg",
    alt: "Car detailing service 6",
  },
  {
    id: 7,
    url: "/dashboard1.jpg",
    alt: "Car detailing service 7",
  },
];

export const GallerySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Mouse drag functionality for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch drag functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden bg-white py-12 sm:py-16"
    >
      <div className="container mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          className="text-center"
        >
        </motion.div>
      </div>

      {/* Full-width image strip - with drag scrolling */}
      <div className="w-full relative">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            cursor: "grab",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <style>
            {`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-6">
            {galleryImages.map((image, index) => (
              <GalleryImage
                key={image.id}
                image={image}
                index={index}
                controls={controls}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint for all devices */}
      <div className="text-center mt-6 text-gray-400 text-xs flex items-center justify-center gap-2">
        <span>←</span>
        <span>Drag or swipe to see more</span>
        <span>→</span>
      </div>
    </section>
  );
};

interface GalleryImageProps {
  image: {
    id: number;
    url: string;
    alt: string;
  };
  index: number;
  controls: any;
}

const GalleryImage = ({ image, index, controls }: GalleryImageProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        visible: (i: number) => ({
          opacity: 1,
          scale: 1,
          transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut",
          },
        }),
      }}
      className="relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <motion.img
          src={image.url}
          alt={image.alt}
          className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] object-cover rounded-xl cursor-grab active:cursor-grabbing pointer-events-none"
          animate={{
            scale: isHovered ? 0.95 : 1,
            filter: isHovered ? "grayscale(100%)" : "grayscale(0%)",
          }}
          transition={{
            scale: { duration: 0.3, ease: "easeInOut" },
            filter: { duration: 0.3, ease: "easeInOut" },
          }}
          style={{
            willChange: "transform, filter",
          }}
          draggable={false}
        />
      </div>
    </motion.div>
  );
};