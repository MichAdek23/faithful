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

export function BookingPage() {
  useSEO({
    title: "Book Your Car Wash",
    description:
      "Schedule your professional mobile car wash and detailing service with Faithful Auto Care. Choose from Basic Refresh, Premium, or Ultimate packages. We come to your location across the UK.",
    canonical: "/book-now",
    keywords:
      "book car wash, schedule car detailing, mobile car wash booking, car valet appointment, Faithful Auto Care booking",
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.step || 1;
      } catch { return 1; }
    }
    return 1;
  });

  const [bookingData, setBookingData] = useState<Partial<BookingData>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.data || {};
      } catch { return {}; }
    }
    return {};
  });

  const [bookingId, setBookingId] = useState<string>('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);

  useEffect(() => {
    if (currentStep < 5) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: currentStep, data: bookingData }));
    }
  }, [currentStep, bookingData]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
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

  return (
    <div className="min-h-screen bg-gray-50">
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