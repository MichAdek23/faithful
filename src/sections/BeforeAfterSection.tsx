import { useState } from "react";
import { Images, X } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface GalleryImage {
  id: number;
  src: string;
}

// Gallery images
const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/BeforeAfter1.PNG"
  },
  {
    id: 2,
    src: "/BeforeAfter2.PNG"
  },
  {
    id: 4,
    src: "/BeforeAfter4.PNG"
  },
  {
    id: 5,
    src: "/BeforeAfter5.jpeg"
  },
  {
    id: 6,
    src: "/displaytires.jpeg"
  },
  {
    id: 7,
    src: "/ExteriorDisplay.jpeg"
  },
  {
    id: 8,
    src: "/InteriorSection.jpeg"
  },
  {
    id: 9,
    src: "/displaytires2.jpeg"
  },
  {
    id: 10,
    src: "/gridCar1.jpeg"
  },
  {
    id: 11,
    src: "/gridCar2.jpeg"
  },
  {
    id: 12,
    src: "/engineMix.jpeg"
  }

];

export const PhotoGallerySection = () => {
  const { ref: sectionRef } = useScrollAnimation();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Get visible images (for "See More" functionality)
  const visibleImages = galleryImages.slice(0, visibleCount);
  const hasMore = visibleCount < galleryImages.length;

  const loadMoreImages = () => {
    setVisibleCount(prev => Math.min(prev + 6, galleryImages.length));
  };

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <section 
        ref={sectionRef}
        id="photo-gallery" 
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
              <Images className="w-4 h-4" />
              <span className="text-sm font-medium">Our Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Photo Gallery
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Browse through our work and see the quality we deliver
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleImages.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                onClick={() => openLightbox(image)}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    openLightbox(image);
                  }
                }}
              >
                <div className="relative overflow-hidden h-64">
                  <img
                    src={image.src}
                    alt={`Gallery image ${image.id}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      console.error(`Failed to load image: ${image.src}`);
                      e.currentTarget.src = "/fallback-image.jpg";
                    }}
                  />
                  {/* Dark gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* See More Photos Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMoreImages}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Images className="w-5 h-5" />
                See More Photos ({galleryImages.length - visibleCount} more)
              </button>
            </div>
          )}

          {/* Show all loaded message */}
          {!hasMore && galleryImages.length > 6 && (
            <div className="text-center mt-12">
              <p className="text-gray-500 text-sm">
                You've seen all {galleryImages.length} photos in our gallery
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fadeIn"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl mx-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image */}
            <img
              src={selectedImage.src}
              alt="Gallery image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};