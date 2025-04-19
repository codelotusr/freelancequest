import { Label, TextInput, Button, Select } from "flowbite-react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { FaMapMarkerAlt, FaCity, FaGlobe, FaMailBulk } from "react-icons/fa";

interface Props {
  formData: OnboardingFormData;
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CITIES = [
  "Vilnius",
  "Kaunas",
  "Klaipėda",
  "Šiauliai",
  "Panevėžys",
  "Alytus",
  "Marijampolė",
  "Utena",
  "Telšiai",
  "Tauragė",
];

export default function OnboardingStepFourAddress({
  formData,
  onChange,
  onNext,
  onBack,
}: Props) {
  const address = formData.address || {
    street: "",
    city: "",
    postal_code: "",
    country: "",
  };

  if (!address.country) {
    address.country = "Lietuva";
    onChange({ address });
  }

  const handleAddressChange = (field: keyof typeof address, value: string) => {
    onChange({
      address: {
        ...address,
        [field]: value,
      },
    });
  };

  const isValid =
    address.street.trim() &&
    address.city.trim() &&
    address.postal_code.trim() &&
    address.country.trim();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="country" className="mb-1 flex items-center gap-2">
          <FaGlobe className="text-yellow-500" /> Šalis
        </Label>
        <TextInput
          id="country"
          value={address.country}
          onChange={(e) => handleAddressChange("country", e.target.value)}
          placeholder="pvz. Lietuva"
        />
      </div>

      <div>
        <Label htmlFor="city" className="mb-1 flex items-center gap-2">
          <FaCity className="text-green-500" /> Miestas
        </Label>
        <Select
          id="city"
          value={address.city}
          onChange={(e) => handleAddressChange("city", e.target.value)}
        >
          <option value="">Pasirinkite miestą</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="street" className="mb-1 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" /> Gatvė
        </Label>
        <TextInput
          id="street"
          value={address.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          placeholder="pvz. Gedimino pr. 1"
        />
      </div>

      <div>
        <Label htmlFor="postal_code" className="mb-1 flex items-center gap-2">
          <FaMailBulk className="text-purple-500" /> Pašto kodas
        </Label>
        <TextInput
          id="postal_code"
          value={address.postal_code}
          onChange={(e) => handleAddressChange("postal_code", e.target.value)}
          placeholder="pvz. 01103"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
        <div className="flex-1">
          <Button color="gray" onClick={onBack} className="w-full">
            Atgal
          </Button>
        </div>
        <div className="flex-1">
          <Button onClick={onNext} disabled={!isValid} className="w-full">
            Toliau
          </Button>
        </div>
      </div>
    </div>
  );
}

