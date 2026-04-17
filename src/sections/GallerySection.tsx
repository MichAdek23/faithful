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
    url: "/BeforeAfter1.PNG",
    alt: "Car detailing service 6",
  },
];

export const GallerySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

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

      {/* Full-width image strip - centered */}
      <div className="w-full relative">
        {/* Horizontal scrolling container with center justification */}
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 min-w-max justify-center">
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

      {/* Scroll hint for mobile */}
      <div className="block sm:hidden text-center mt-6 text-gray-400 text-xs">
        ← Swipe to see more →
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
      className="relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <motion.img
          src={image.url}
          alt={image.alt}
          className="w-full h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] object-cover rounded-xl cursor-pointer"
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
        />
      </div>
    </motion.div>
  );
};