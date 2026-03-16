import { useState } from 'react';
import { Droplet, Sparkles, Gem, Plus, Trash2, Car, Gift } from 'lucide-react';
import { Button } from '../ui/button';
import type { CarEntry } from '../../pages/BookingPage';

interface ServiceStepProps {
  cars: CarEntry[];
  onCarsChange: (cars: CarEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const services = [
  {
    name: 'Basic Refresh Package',
    icon: Droplet,
    description: 'Interior OR Exterior clean (not both). A quick, refreshing touch-up.',
    duration: '1 - 1.5 hrs',
  },
  {
    name: 'Premium Package',
    icon: Sparkles,
    description: 'Full interior & exterior valet. Our most popular service.',
    duration: '3 - 3.5 hrs',
  },
  {
    name: 'Ultimate Package',
    icon: Gem,
    description: 'Showroom-standard deep clean with stain remover treatment.',
    duration: '4 - 4.5 hrs',
  },
];

type VehicleType = 'Car' | 'Motorcycle' | 'Van' | 'Lorry / Truck / Commercial';

const vehiclesByService: Record<string, VehicleType[]> = {
  'Basic Refresh Package': ['Car', 'Motorcycle', 'Van', 'Lorry / Truck / Commercial'],
  'Premium Package': ['Car', 'Van'],
  'Ultimate Package': ['Car', 'Van', 'Lorry / Truck / Commercial'],
};

const pricingMap: Record<string, Record<string, number>> = {
  'Basic Refresh Package': {
    'Car': 35,
    'Motorcycle': 35,
    'Van': 65,
    'Lorry / Truck / Commercial': 150,
  },
  'Premium Package': {
    'Car': 70,
    'Van': 120,
  },
  'Ultimate Package': {
    'Car': 155,
    'Van': 200,
    'Lorry / Truck / Commercial': 280,
  },
};

function getPrice(service: string, vehicle: string): number {
  return pricingMap[service]?.[vehicle] ?? 0;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function ServiceStep({ cars, onCarsChange, onNext, onBack }: ServiceStepProps) {
  const [localCars, setLocalCars] = useState<CarEntry[]>(() => {
    if (cars.length > 0) return cars;
    return [{ id: generateId(), serviceType: '', servicePrice: 0, vehicleType: '' }];
  });
  const [expandedCarIndex, setExpandedCarIndex] = useState(
    cars.length > 0 && cars.every(c => c.serviceType && c.vehicleType) ? -1 : 0
  );

  const updateCar = (index: number, updates: Partial<CarEntry>) => {
    const updated = localCars.map((car, i) => (i === index ? { ...car, ...updates } : car));
    setLocalCars(updated);
    onCarsChange(updated);
  };

  const addCar = () => {
    const newCar: CarEntry = { id: generateId(), serviceType: '', servicePrice: 0, vehicleType: '' };
    const updated = [...localCars, newCar];
    setLocalCars(updated);
    onCarsChange(updated);
    setExpandedCarIndex(updated.length - 1);
  };

  const removeCar = (index: number) => {
    const updated = localCars.filter((_, i) => i !== index);
    setLocalCars(updated);
    onCarsChange(updated);
    if (expandedCarIndex === index) {
      setExpandedCarIndex(updated.length > 0 ? 0 : -1);
    } else if (expandedCarIndex > index) {
      setExpandedCarIndex(expandedCarIndex - 1);
    }
  };

  const allCarsComplete = localCars.length > 0 && localCars.every(
    (car) => car.serviceType && car.vehicleType && car.servicePrice > 0
  );

  const subtotal = localCars.reduce((sum, car) => sum + car.servicePrice, 0);
  const carsUntilFree = Math.max(0, 5 - localCars.length);

  const handleNext = () => {
    if (allCarsComplete) {
      onCarsChange(localCars);
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Choose Your Service</h3>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800 text-sm">Book 5 cars, get 1 FREE!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {localCars.length < 5
                ? `Add ${carsUntilFree} more car${carsUntilFree !== 1 ? 's' : ''} to unlock this deal. The cheapest car wash will be on us.`
                : 'Deal unlocked! The cheapest car in your order is FREE.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {localCars.map((car, index) => {
          const isExpanded = expandedCarIndex === index;
          const isComplete = car.serviceType && car.vehicleType && car.servicePrice > 0;

          return (
            <div key={car.id} className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => setExpandedCarIndex(isExpanded ? -1 : index)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isComplete ? 'bg-[#1E90FF] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">
                      {isComplete ? `${car.serviceType} - ${car.vehicleType}` : `Car ${index + 1}`}
                    </p>
                    {isComplete && (
                      <p className="text-xs text-[#1E90FF] font-semibold">
                        {localCars.length >= 5 && car.servicePrice === Math.min(...localCars.map(c => c.servicePrice))
                          ? 'FREE'
                          : `£${car.servicePrice}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {localCars.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCar(index);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <CarServiceSelector
                  car={car}
                  onUpdate={(updates) => updateCar(index, updates)}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addCar}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1E90FF] hover:text-[#1E90FF] hover:bg-blue-50/50 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">Add Another Car</span>
      </button>

      {subtotal > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#1E90FF]" />
              <span className="text-sm text-gray-700 font-medium">
                {localCars.length} car{localCars.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1E90FF]">£{subtotal}</p>
          </div>
          {localCars.length >= 5 && (
            <p className="text-xs text-emerald-600 font-medium mt-2 text-right">
              Cheapest car FREE at checkout!
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!allCarsComplete}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function CarServiceSelector({
  car,
  onUpdate,
}: {
  car: CarEntry;
  onUpdate: (updates: Partial<CarEntry>) => void;
}) {
  const availableVehicles = car.serviceType ? vehiclesByService[car.serviceType] || [] : [];

  const handleServiceClick = (name: string) => {
    const currentVehicle = car.vehicleType;
    if (currentVehicle && pricingMap[name]?.[currentVehicle] != null) {
      onUpdate({ serviceType: name, servicePrice: getPrice(name, currentVehicle) });
    } else {
      onUpdate({ serviceType: name, servicePrice: 0, vehicleType: '' });
    }
  };

  const handleVehicleClick = (type: string) => {
    onUpdate({ vehicleType: type, servicePrice: getPrice(car.serviceType, type) });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {services.map((service, sIdx) => {
          const Icon = service.icon;
          const isSelected = car.serviceType === service.name;
          const isPremium = sIdx === 1;

          return (
            <button
              key={service.name}
              onClick={() => handleServiceClick(service.name)}
              className={`
                p-4 sm:p-5 rounded-xl border-2 transition-all text-left
                ${isSelected ? 'border-[#1E90FF] bg-blue-50 shadow-md' : ''}
                ${isPremium && !isSelected ? 'border-[#1E90FF] bg-[#1E90FF] text-white shadow-lg' : ''}
                ${!isSelected && !isPremium ? 'border-gray-300 bg-white hover:border-[#1E90FF] hover:shadow-md' : ''}
              `}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className={`w-8 h-8 ${isPremium && !isSelected ? 'text-white' : 'text-[#1E90FF]'}`} />
                <div className="space-y-1">
                  <h4 className={`font-semibold text-xs sm:text-sm ${isPremium && !isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {service.name}
                  </h4>
                  <p className={`text-xs ${isPremium && !isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                  <p className={`text-xs ${isPremium && !isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                    {service.duration}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {car.serviceType && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Vehicle Type</h4>
          <div className={`grid gap-3 ${availableVehicles.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {availableVehicles.map((type) => {
              const isSelected = car.vehicleType === type;
              const price = getPrice(car.serviceType, type);

              return (
                <button
                  key={type}
                  onClick={() => handleVehicleClick(type)}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${isSelected ? 'border-[#1E90FF] bg-blue-50 text-[#1E90FF]' : 'border-gray-300 bg-white hover:border-[#1E90FF] text-gray-900'}
                  `}
                >
                  <span className="font-medium text-xs sm:text-sm">{type}</span>
                  <p className={`text-base font-bold mt-1 ${isSelected ? 'text-[#1E90FF]' : 'text-gray-900'}`}>
                    £{price}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
