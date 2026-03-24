import { useState, useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';
import { DateStep } from '../components/booking/DateStep';
import { TimeStep } from '../components/booking/TimeStep';
import { ServiceStep } from '../components/booking/ServiceStep';
import { DetailsStep } from '../components/booking/DetailsStep';
import { ConfirmationStep } from '../components/booking/ConfirmationStep';
import { FooterSection } from '../sections/FooterSection';

const STORAGE_KEY = 'faithful-booking-draft';

export interface CarEntry {
  id: string;
  serviceType: string;
  servicePrice: number;
  vehicleType: string;
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
}

export interface DiscountInfo {
  isFirstTime: boolean;
  firstTimeDiscount: number;
  multiCarDiscount: number;
  originalTotal: number;
  finalTotal: number;
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
  const [isClient, setIsClient] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [bookingId, setBookingId] = useState<string>('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);

  // Initialize state from localStorage only on client side
  useEffect(() => {
    setIsClient(true);
    
    const saved = getSafeLocalStorage(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step) setCurrentStep(parsed.step);
        if (parsed.data) setBookingData(parsed.data);
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
      setSafeLocalStorage(STORAGE_KEY, JSON.stringify({ step: currentStep, data: bookingData }));
    }
  }, [currentStep, bookingData, isClient]);

  const clearDraft = () => {
    if (isClient) {
      removeSafeLocalStorage(STORAGE_KEY);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
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

  // Don't render anything until client-side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>
      
      {/* Enhanced Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-6 sm:p-8 animate-in fade-in zoom-in duration-300 overflow-hidden">
            {/* Border animations only - no cars */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top border animation */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1E90FF] to-transparent animate-slide-x" />
              {/* Right border animation */}
              <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[#1E90FF] to-transparent animate-slide-y" />
              {/* Bottom border animation */}
              <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#1E90FF] to-transparent animate-slide-x-reverse" />
              {/* Left border animation */}
              <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[#1E90FF] to-transparent animate-slide-y-reverse" />
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
                  <span className="font-medium">Same day service</span>
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
                onDateSelect={(date: string) => updateBookingData({ date })}
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
                onDetailsChange={updateBookingData}
                onNext={() => nextStep()}
                onBack={prevStep}
                bookingData={bookingData as BookingData}
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