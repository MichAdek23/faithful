import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Review {
  id: string;
  customer_name: string;
  service_type: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();

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

  if (reviews.length === 0) {
    return null;
  }

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={titleRef} className={`text-center mb-12 sm:mb-16 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 animate-scroll-horizontal hover:[animation-play-state:paused]">
            {duplicatedReviews.map((review, index) => (
              <Card
                key={`${review.id}-${index}`}
                className="bg-gray-50 border-none shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 flex-shrink-0 w-[320px] sm:w-[380px]"
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
      </div>
    </section>
  );
};
