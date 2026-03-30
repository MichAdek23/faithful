import { useEffect, useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, X, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { SoftButton } from "@/components/ui/softbutton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


interface Review {
  id: string;
  customer_name: string;
  service_type: string;
  rating: number;
  comment: string;
  created_at: string;
  google_review_id?: string;
}

interface ReviewFormData {
  customer_name: string;
  rating: number;
  comment: string;
  service_type: string;
  email?: string;
}

// Review Form Modal Component
const ReviewFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: ReviewFormData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    customer_name: "",
    rating: 5,
    comment: "",
    service_type: "Car Detailing",
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.comment.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        customer_name: "",
        rating: 5,
        comment: "",
        service_type: "Car Detailing",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h3 className="font-poppins font-semibold text-[#002855] text-xl">
            Write a Review
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="John Doe"
                required
                className="w-full"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Car Detailing</option>
                <option>Interior Cleaning</option>
                <option>Exterior Polishing</option>
                <option>Paint Correction</option>
                <option>Ceramic Coating</option>
                <option>Other</option>
              </select>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredRating || formData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your experience with us..."
                rows={4}
                required
                className="w-full"
              />
            </div>

            {/* Optional Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional - for follow-up)
              </label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#002855] text-white hover:bg-[#002855]/90"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) {
      setReviews(data);
    }
    setLoading(false);
  };

  const submitReviewToGoogle = async (reviewData: ReviewFormData) => {
    // This is a placeholder - you'll need to implement Google Reviews API integration
    // Note: Google Places API requires a Place ID and API key
    const googlePlaceId = "YOUR_GOOGLE_PLACE_ID"; // Replace with your actual Place ID
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    
    // Google Reviews API doesn't allow direct posting of reviews
    // Instead, we'll redirect users to Google Reviews page
    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
    window.open(googleReviewUrl, '_blank');
    
    return googleReviewUrl;
  };

  const submitReview = async (reviewData: ReviewFormData) => {
    try {
      // 1. Save review to Supabase
      const { data: savedReview, error: dbError } = await supabase
        .from("reviews")
        .insert([
          {
            customer_name: reviewData.customer_name,
            service_type: reviewData.service_type,
            rating: reviewData.rating,
            comment: reviewData.comment,
            status: "pending", // Set as pending for admin approval
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Open Google Reviews in a new tab for user to leave review there as well
      const googlePlaceId = "YOUR_GOOGLE_PLACE_ID"; // Replace with your actual Google Place ID
      const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;
      
      // 3. Show success message with option to also review on Google
      toast({
        title: "Review Submitted! 🎉",
        description: "Thank you for your feedback! Would you also like to leave a review on Google?",
        action: (
          <Button
            onClick={() => window.open(googleReviewUrl, '_blank')}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Review on Google
          </Button>
        ),
        duration: 10000,
      });

      // 4. Refresh reviews list to show new review (if approved)
      setTimeout(() => {
        fetchReviews();
      }, 2000);

    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(prev => prev + 1);
      scrollToIndex(currentIndex + 1);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 320 + 24;
      container.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current && reviews.length > 0) {
        scrollToIndex(currentIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, reviews.length]);

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="text-gray-500">Loading reviews...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 sm:py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div ref={titleRef} className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4 mb-6">
              Don't just take our word for it - hear from our satisfied customers
            </p>
            
            {/* Write a Review Button */}
            <SoftButton
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg px-6 py-3"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </SoftButton>
          </div>

          {/* Navigation Buttons */}
          <div className="relative max-w-7xl mx-auto">
            {/* Left Navigation Button */}
            <SoftButton
              variant="outline"
              size="icon"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
                currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'
              }`}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </SoftButton>

            {/* Right Navigation Button */}
            <SoftButton
              variant="outline"
              size="icon"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
                currentIndex === reviews.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'
              }`}
              onClick={handleNext}
              disabled={currentIndex === reviews.length - 1}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </SoftButton>

            {/* Reviews Container with Touch Support */}
            <div 
              className="relative w-full overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {reviews.map((review, index) => (
                  <Card
                    key={`${review.id}-${index}`}
                    className="bg-gray-50 border-none shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 flex-shrink-0 w-[320px] sm:w-[380px] snap-start"
                  >
                    <CardContent className="p-6 sm:p-8">
                      <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-3 sm:mb-4 opacity-50" />

                      <div className="flex gap-1 mb-3 sm:mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed line-clamp-4">
                        "{review.comment}"
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.customer_name}
                          </p>
                          <p className="text-sm text-gray-500">{getTimeAgo(review.created_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            {reviews.length > 0 && (
              <div className="flex justify-center mt-8 gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'w-6 bg-blue-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      scrollToIndex(index);
                    }}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitReview}
      />
    </>
  );
};