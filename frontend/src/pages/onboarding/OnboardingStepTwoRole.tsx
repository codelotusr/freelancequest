import { Button } from "flowbite-react";
import { FaUserTie, FaBriefcase } from "react-icons/fa";
import { OnboardingFormData, Role } from "../../components/OnboardingFormData"


interface Props {
  formData: OnboardingFormData;
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStepTwoRole({ formData, onChange, onNext, onBack }: Props) {
  const handleSelectRole = (role: Role) => {
    onChange({ role });
  };

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="text-left space-y-2">
        <h2 className="text-xl font-semibold dark:text-white">Pasirink savo rolę</h2>
        <p className="text-sm text-gray-400">Pasirink, ar nori būti laisvai samdomas specialistas, ar ieškai specialistų savo projektui.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          type="button"
          onClick={() => handleSelectRole("freelancer")}
          className={`flex-1 border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${formData.role === "freelancer"
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "border-gray-300 dark:border-gray-600"
            }`}
        >
          <div className="flex flex-col items-center">
            <FaUserTie className="text-3xl mb-2 text-blue-500" />
            <span className="font-medium dark:text-white">Darbuotojas</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Siūlai paslaugas, gauni užsakymus</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRole("client")}
          className={`flex-1 border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${formData.role === "client"
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "border-gray-300 dark:border-gray-600"
            }`}
        >
          <div className="flex flex-col items-center">
            <FaBriefcase className="text-3xl mb-2 text-blue-500" />
            <span className="font-medium dark:text-white">Klientas</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ieškai specialistų savo projektui</p>
          </div>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
        <div className="flex-1">
          <Button color="gray" onClick={onBack} className="w-full">
            Atgal
          </Button>
        </div>

        <div className="flex-1">
          <Button onClick={onNext} disabled={!formData.role} className="w-full">
            Toliau
          </Button>
        </div>
      </div>

    </div>
  );
}

