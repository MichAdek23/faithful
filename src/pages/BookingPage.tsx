import { useState } from 'react';
import { DateStep } from '../components/booking/DateStep';
import { TimeStep } from '../components/booking/TimeStep';
import { ServiceStep } from '../components/booking/ServiceStep';
import { DetailsStep } from '../components/booking/DetailsStep';
import { ConfirmationStep } from '../components/booking/ConfirmationStep';
import { FooterSection } from '../sections/FooterSection';

interface BookingData {
  date: string;
  time: string;
  serviceType: string;
  servicePrice: number;
  vehicleType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [bookingId, setBookingId] = useState<string>('');

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 bg-cover bg-center" style={{ backgroundImage: 'url(/washing.jpg)' }}>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white tracking-wide">
            BOOK <span className="text-[#1E90FF]">NOW</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">FAITHFUL AUTO CARE</h2>
            <p className="text-gray-600 mt-1">Professional Shine, Exceptional Care</p>
          </div>

          <div className="flex items-center justify-between mb-12 px-4">
            <StepIndicator step={1} label="Date" active={currentStep >= 1} />
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
            <StepIndicator step={2} label="Time" active={currentStep >= 2} />
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
            <StepIndicator step={3} label="Service" active={currentStep >= 3} />
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 4 ? 'bg-[#1E90FF]' : 'bg-gray-200'}`} />
            <StepIndicator step={4} label="Details" active={currentStep >= 4} />
          </div>

          {currentStep === 1 && (
            <DateStep
              selectedDate={bookingData.date}
              onDateSelect={(date) => updateBookingData({ date })}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <TimeStep
              selectedTime={bookingData.time}
              selectedDate={bookingData.date}
              onTimeSelect={(time) => updateBookingData({ time })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <ServiceStep
              selectedService={bookingData.serviceType}
              selectedVehicle={bookingData.vehicleType}
              onServiceSelect={(serviceType, servicePrice) =>
                updateBookingData({ serviceType, servicePrice })
              }
              onVehicleSelect={(vehicleType) => updateBookingData({ vehicleType })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <DetailsStep
              customerName={bookingData.customerName}
              customerEmail={bookingData.customerEmail}
              customerPhone={bookingData.customerPhone}
              onDetailsChange={updateBookingData}
              onNext={(id) => {
                setBookingId(id);
                nextStep();
              }}
              onBack={prevStep}
              bookingData={bookingData as BookingData}
            />
          )}

          {currentStep === 5 && (
            <ConfirmationStep
              bookingData={bookingData as BookingData}
              bookingId={bookingId}
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
        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-colors ${
          active ? 'bg-[#1E90FF] text-white' : 'bg-gray-200 text-gray-500'
        }`}
      >
        {step}
      </div>
      <span className={`text-sm mt-2 font-medium ${active ? 'text-[#1E90FF]' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
