import { useState, useEffect } from 'react';
import { Droplet, Sparkles, Gem } from 'lucide-react';
import { Button } from '../ui/button';

interface ServiceStepProps {
  selectedService?: string;
  selectedVehicle?: string;
  onServiceSelect: (serviceType: string, servicePrice: number) => void;
  onVehicleSelect: (vehicleType: string) => void;
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

export function ServiceStep({
  selectedService,
  selectedVehicle,
  onServiceSelect,
  onVehicleSelect,
  onNext,
  onBack,
}: ServiceStepProps) {
  const [localSelectedService, setLocalSelectedService] = useState(selectedService || '');
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(selectedVehicle || '');

  const availableVehicles = localSelectedService
    ? vehiclesByService[localSelectedService] || []
    : [];

  useEffect(() => {
    if (localSelectedService && localSelectedVehicle) {
      if (!availableVehicles.includes(localSelectedVehicle as VehicleType)) {
        setLocalSelectedVehicle('');
        onVehicleSelect('');
      }
    }
  }, [localSelectedService]);

  const handleServiceClick = (name: string) => {
    setLocalSelectedService(name);
    if (localSelectedVehicle && pricingMap[name]?.[localSelectedVehicle] != null) {
      onServiceSelect(name, getPrice(name, localSelectedVehicle));
    } else {
      onServiceSelect(name, 0);
    }
  };

  const handleVehicleClick = (type: string) => {
    setLocalSelectedVehicle(type);
    onVehicleSelect(type);
    if (localSelectedService) {
      onServiceSelect(localSelectedService, getPrice(localSelectedService, type));
    }
  };

  const currentPrice =
    localSelectedService && localSelectedVehicle
      ? getPrice(localSelectedService, localSelectedVehicle)
      : 0;

  const handleNext = () => {
    if (localSelectedService && localSelectedVehicle && currentPrice > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Choose Your Service</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          const isSelected = localSelectedService === service.name;
          const isPremium = index === 1;

          return (
            <button
              key={service.name}
              onClick={() => handleServiceClick(service.name)}
              className={`
                p-5 sm:p-6 rounded-xl border-2 transition-all text-left
                ${isSelected ? 'border-[#1E90FF] bg-blue-50 shadow-md' : ''}
                ${isPremium && !isSelected ? 'border-[#1E90FF] bg-[#1E90FF] text-white shadow-lg' : ''}
                ${!isSelected && !isPremium ? 'border-gray-300 bg-white hover:border-[#1E90FF] hover:shadow-md' : ''}
              `}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Icon className={`w-10 h-10 ${isPremium && !isSelected ? 'text-white' : 'text-[#1E90FF]'}`} />
                <div className="space-y-1">
                  <h4 className={`font-semibold text-sm sm:text-base ${isPremium && !isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {service.name}
                  </h4>
                  <p className={`text-xs sm:text-sm ${isPremium && !isSelected ? 'text-blue-100' : 'text-gray-600'}`}>
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

      {localSelectedService && (
        <div className="space-y-4 pt-4">
          <h4 className="text-lg font-semibold text-gray-900">Vehicle Type</h4>
          <div className={`grid gap-4 ${availableVehicles.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {availableVehicles.map((type) => {
              const isSelected = localSelectedVehicle === type;
              const price = getPrice(localSelectedService, type);

              return (
                <button
                  key={type}
                  onClick={() => handleVehicleClick(type)}
                  className={`
                    p-4 rounded-lg border-2 text-center transition-all
                    ${isSelected ? 'border-[#1E90FF] bg-blue-50 text-[#1E90FF]' : 'border-gray-300 bg-white hover:border-[#1E90FF] text-gray-900'}
                  `}
                >
                  <span className="font-medium text-sm">{type}</span>
                  <p className={`text-lg font-bold mt-1 ${isSelected ? 'text-[#1E90FF]' : 'text-gray-900'}`}>
                    £{price}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentPrice > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{localSelectedService}</p>
            <p className="text-xs text-gray-500">{localSelectedVehicle}</p>
          </div>
          <p className="text-2xl font-bold text-[#1E90FF]">£{currentPrice}</p>
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!localSelectedService || !localSelectedVehicle || currentPrice === 0}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
