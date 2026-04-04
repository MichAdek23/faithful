import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { DateStep } from '../components/booking/DateStep';
import { TimeStep } from '../components/booking/TimeStep';
import { ServiceStep } from '../components/booking/ServiceStep';
import { DetailsStep } from '../components/booking/DetailsStep';
import { ConfirmationStep } from '../components/booking/ConfirmationStep';
import { FooterSection } from '../sections/FooterSection';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'faithful-booking-draft';

export interface CarEntry {
  id: string;
  /**
   * The service name chosen for this vehicle (e.g. "Basic Package – £25").
   */
  serviceType: string;
  /**
   * Base price of the selected service before any add‑ons. This value does not include
   * the condition fee or location surcharge. Pricing adjustments (e.g. first time
   * discounts) should be calculated separately.
   */
  servicePrice: number;
  /**
   * A high‑level vehicle category (e.g. Car, Van). This remains unchanged from
   * the original implementation.
   */
  vehicleType: string;
  /**
   * Free‑form details about the vehicle. Customers can provide information such as
   * make, model, colour or registration to help the valeting team identify the car.
   */
  vehicleDetails?: string;
  /**
   * Indicates how dirty the vehicle is. Supported values: "mild", "medium" or
   * "very_dirty". This property is optional; if omitted it is treated as
   * "mild" with no additional fee.
   */
  vehicleCondition?: string;
  /**
   * An extra fee applied based on the selected vehicle condition. A value of
   * 0 means no extra charge; 3 for medium dirt and 5 for very dirty. When
   * undefined it defaults to 0.
   */
  conditionFee?: number;
  /**
   * A per‑booking location surcharge. If the booking address is more than
   * five minutes from the service area a flat £14 fee applies. This value
   * is duplicated across car entries for convenience when storing in the
   * database.
   */
  locationSurcharge?: number;
}

export interface BookingData {
  date: string;
  time: string;
  cars: CarEntry[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  houseNumber: string;
  streetName: string;
  postCode: string;
  city: string;
  /**
   * Approximate travel time from the service area to the customer's location, in
   * minutes. A surcharge is added if this exceeds 5 minutes. This value
   * originates from user input in the details step.
   */
  distanceFromServiceArea?: number;
  /**
   * Same-day booking fee (£5 if booking for today)
   */
  sameDayFee?: number;
}

export interface DiscountInfo {
  isFirstTime: boolean;
  firstTimeDiscount: number;
  multiCarDiscount: number;
  originalTotal: number;
  finalTotal: number;
  /**
   * Total of all condition fees across the booking. Included in originalTotal.
   */
  conditionFees?: number;
  /**
   * Location surcharge applied once per booking. Included in originalTotal.
   */
  locationSurcharge?: number;
  /**
   * Same-day booking fee. Included in originalTotal.
   */
  sameDayFee?: number;
}

// CSS animation keyframes as a string to inject
const animationStyles = `
  @keyframes slide-x {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  @keyframes slide-y {
    0% {
      transform: translateY(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(100%);
      opacity: 0;
    }
  }
  
  @keyframes slide-x-reverse {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  @keyframes slide-y-reverse {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
  
  @keyframes run-around {
    0% {
      top: 0%;
      left: 0%;
      transform: rotate(0deg);
    }
    25% {
      top: 0%;
      left: calc(100% - 2rem);
      transform: rotate(90deg);
    }
    50% {
      top: calc(100% - 2rem);
      left: calc(100% - 2rem);
      transform: rotate(180deg);
    }
    75% {
      top: calc(100% - 2rem);
      left: 0%;
      transform: rotate(270deg);
    }
    100% {
      top: 0%;
      left: 0%;
      transform: rotate(360deg);
    }
  }
  
  @keyframes run-around-delayed {
    0% {
      top: 0%;
      left: 0%;
      transform: rotate(0deg);
      opacity: 0;
    }
    12.5% {
      opacity: 1;
    }
    25% {
      top: 0%;
      left: calc(100% - 1.25rem);
      transform: rotate(90deg);
    }
    50% {
      top: calc(100% - 1.25rem);
      left: calc(100% - 1.25rem);
      transform: rotate(180deg);
    }
    75% {
      top: calc(100% - 1.25rem);
      left: 0%;
      transform: rotate(270deg);
    }
    87.5% {
      opacity: 1;
    }
    100% {
      top: 0%;
      left: 0%;
      transform: rotate(360deg);
      opacity: 0;
    }
  }
  
  .animate-slide-x {
    animation: slide-x 2s linear infinite;
  }
  
  .animate-slide-y {
    animation: slide-y 2s linear infinite;
  }
  
  .animate-slide-x-reverse {
    animation: slide-x-reverse 2s linear infinite;
  }
  
  .animate-slide-y-reverse {
    animation: slide-y-reverse 2s linear infinite;
  }
  
  .animate-run-around {
    animation: run-around 6s linear infinite;
  }
  
  .animate-run-around-delayed {
    animation: run-around-delayed 6s linear infinite;
  }
`;

// Helper function to safely get localStorage item
const getSafeLocalStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (error) {
    console.warn('localStorage access failed:', error);
  }
  return null;
};

// Helper function to safely set localStorage item
const setSafeLocalStorage = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn('localStorage access failed:', error);
  }
};

// Helper function to safely remove localStorage item
const removeSafeLocalStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('localStorage access failed:', error);
  }
};

export function BookingPage() {
  useSEO({
    title: "Book Your Car Wash",
    description:
      "Schedule your professional mobile car wash and detailing service with Faithful Auto Care. Choose from Basic Refresh, Premium, or Ultimate packages. We come to your location across the UK.",
    canonical: "/book-now",
    keywords:
      "book car wash, schedule car detailing, mobile car wash booking, car valet appointment, Faithful Auto Care booking",
  });

  const [showPopup, setShowPopup] = useState<boolean>(true);
  const [showReviewPopup, setShowReviewPopup] = useState<boolean>(false);
  const [reviewBookingId, setReviewBookingId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [bookingId, setBookingId] = useState<string>('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [sameDayFee, setSameDayFee] = useState<number>(0); // Add sameDayFee state

  // Initialize state from localStorage only on client side
  useEffect(() => {
    setIsClient(true);

    const params = new URLSearchParams(window.location.search);
    if (params.get('review') === 'true') {
      setShowReviewPopup(true);
      setReviewBookingId(params.get('booking_id') || '');
      setShowPopup(false);
    }
    
    const saved = getSafeLocalStorage(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step) setCurrentStep(parsed.step);
        if (parsed.data) {
          setBookingData(parsed.data);
          // Restore sameDayFee if it exists in saved data
          if (parsed.data.sameDayFee) setSameDayFee(parsed.data.sameDayFee);
        }
      } catch (error) {
        console.warn('Failed to parse saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-hide popup after 30 seconds
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Save to localStorage only when on client side and not on confirmation step
    if (isClient && currentStep < 5 && Object.keys(bookingData).length > 0) {
      setSafeLocalStorage(STORAGE_KEY, JSON.stringify({ step: currentStep, data: { ...bookingData, sameDayFee } }));
    }
  }, [currentStep, bookingData, sameDayFee, isClient]);

  const clearDraft = () => {
    if (isClient) {
      removeSafeLocalStorage(STORAGE_KEY);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Handle date selection with same-day fee
  const handleDateSelect = (date: string, fee?: number) => {
    updateBookingData({ date });
    setSameDayFee(fee || 0);
  };

  const nextStep = (): void => {
    setCurrentStep((prev: number) => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = (): void => {
    setCurrentStep((prev: number) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle booking completion from ServiceStep
  const handleBookingComplete = (id: string, discount?: DiscountInfo): void => {
    setBookingId(id);
    if (discount) {
      setDiscountInfo(discount);
    }
    clearDraft();
    nextStep();
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const submitReview = async () => {
    if (reviewRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a short comment.');
      return;
    }

    setReviewError('');
    setReviewSubmitting(true);

    const { error } = await supabase.from('reviews').insert([{
      customer_name: bookingData.customerName || 'Anonymous',
      service_type: bookingData.cars?.[0]?.serviceType || 'Car Service',
      rating: reviewRating,
      comment: reviewComment.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    }]);

    setReviewSubmitting(false);

    if (error) {
      setReviewError('Something went wrong. Please try again.');
    } else {
      setReviewSubmitted(true);
    }
  };

  // Don't render anything until client-side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      {/* Review link popup from email */}
      {showReviewPopup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl w-11/12 max-w-lg p-5">
            <button
              onClick={() => setShowReviewPopup(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close review popup"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Thank you for choosing Faithful Auto Care</h3>
            <p className="text-sm text-gray-600 mb-4">Please tell us about your experience and help us improve.</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <span
                    className={`text-3xl ${
                      star <= (hoveredRating || reviewRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              placeholder="Share your experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:ring-2 focus:ring-[#1E90FF] focus:outline-none"
            />
            {reviewError && <p className="text-xs text-red-600 mt-2">{reviewError}</p>}
            {reviewSubmitted && <p className="text-sm text-green-700 mt-2">Thanks! Your review is submitted and pending approval.</p>}
            <button
              onClick={submitReview}
              disabled={reviewSubmitting || reviewSubmitted}
              className="mt-4 w-full py-2.5 bg-[#1E90FF] hover:bg-[#1873CC] text-white rounded-lg font-medium disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting…' : reviewSubmitted ? 'Submitted' : 'Send Review'}
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-6 sm:p-8 animate-in fade-in zoom-in duration-300 overflow-hidden">
            {/* Animated Car SVG that runs around the card */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top border animation */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1E90FF] to-transparent animate-slide-x" />
              {/* Right border animation */}
              <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[#1E90FF] to-transparent animate-slide-y" />
              {/* Bottom border animation */}
              <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1E90FF] to-transparent animate-slide-x-reverse" />
              {/* Left border animation */}
              <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[#1E90FF] to-transparent animate-slide-y-reverse" />
              
              {/* Animated Car SVG - runs around the perimeter */}
              <div className="absolute animate-run-around">
                <svg 
                  className="w-8 h-8 text-[#1E90FF] filter drop-shadow-lg" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              
              {/* Additional smaller car for more dynamic effect */}
              <div className="absolute animate-run-around-delayed">
                <svg 
                  className="w-5 h-5 text-[#1E90FF]/60 filter drop-shadow" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10 bg-white rounded-full p-1 hover:bg-gray-100"
              aria-label="Close popup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center relative z-10">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-[#1E90FF] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Important Notice
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                Extra charges apply due to:
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 group hover:translate-x-1 transition-transform duration-200">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="h-4 w-4 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Location of service</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 group hover:translate-x-1 transition-transform duration-200">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="h-4 w-4 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Size of vehicle</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 group hover:translate-x-1 transition-transform duration-200">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="h-4 w-4 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">How dirty the car is</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 group hover:translate-x-1 transition-transform duration-200">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="h-4 w-4 text-[#1E90FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Same day service (+£5)</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={closePopup}
                  className="w-full py-2.5 px-4 bg-[#1E90FF] text-white font-semibold rounded-lg hover:bg-[#1C86EE] transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Got it, Continue
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  This popup will close automatically in 30 seconds
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Hidden while popup is visible */}
      <div className={showPopup ? 'invisible' : 'visible'}>
        <div className="relative h-48 sm:h-64 bg-cover bg-center" style={{ backgroundImage: 'url(/washing.jpg)' }}>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide">
              BOOK <span className="text-[#1E90FF]">NOW</span>
            </h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8 mb-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">FAITHFUL AUTO CARE</h2>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Professional Shine, Exceptional Care</p>
            </div>

            <div className="flex items-center justify-between mb-6 sm:mb-12 px-0 sm:px-4">
              <StepIndicator step={1} label="Date" active={currentStep >= 1} />
              <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${currentStep >= 2 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
              <StepIndicator step={2} label="Time" active={currentStep >= 2} />
              <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${currentStep >= 3 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
              <StepIndicator step={3} label="Details" active={currentStep >= 3} />
              <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${currentStep >= 4 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
              <StepIndicator step={4} label="Service" active={currentStep >= 4} />
            </div>

            {currentStep === 1 && (
              <DateStep
                selectedDate={bookingData.date}
                onDateSelect={handleDateSelect}
                onNext={nextStep}
              />
            )}

            {currentStep === 2 && (
              <TimeStep
                selectedTime={bookingData.time}
                selectedDate={bookingData.date}
                onTimeSelect={(time: string) => updateBookingData({ time })}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}

            {currentStep === 3 && (
              <DetailsStep
                customerName={bookingData.customerName}
                customerEmail={bookingData.customerEmail}
                customerPhone={bookingData.customerPhone}
                houseNumber={bookingData.houseNumber}
                streetName={bookingData.streetName}
                postCode={bookingData.postCode}
                city={bookingData.city}
                distanceFromServiceArea={bookingData.distanceFromServiceArea}
                onDetailsChange={updateBookingData}
                onNext={() => nextStep()}
                onBack={prevStep}
              />
            )}

            {currentStep === 4 && (
              <ServiceStep
                cars={bookingData.cars || []}
                onCarsChange={(cars: CarEntry[]) => updateBookingData({ cars })}
                onNext={handleBookingComplete}
                onBack={prevStep}
                userEmail={bookingData.customerEmail}
                userPhone={bookingData.customerPhone}
                bookingData={bookingData as BookingData}
                sameDayFee={sameDayFee}
              />
            )}

            {currentStep === 5 && (
              <ConfirmationStep
                bookingData={bookingData as BookingData}
                bookingId={bookingId}
                discountInfo={discountInfo}
              />
            )}
          </div>
        </div>

        <FooterSection />
      </div>
    </div>
  );
}

function StepIndicator({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm sm:text-lg transition-colors ${
          active ? 'bg-[#1E90FF] text-white' : 'bg-gray-200 text-gray-500'
        }`}
      >
        {step}
      </div>
      <span className={`text-xs sm:text-sm mt-1 sm:mt-2 font-medium ${active ? 'text-[#1E90FF]' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}