import React, { useState } from "react";
import { Card } from "flowbite-react";
import { FormData, Role } from "../../components/OnboardingFormData";
import OnboardingStepOneName from "./OnboardingStepOneName";
import OnboardingStepTwoRole from "./OnboardingStepTwoRole";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    role: "",
    profile_picture: null,
  });
  const { role } = formData;

  const stepLabels =
    role === "freelancer"
      ? ["Vardas", "Rolė", "Apie tave", "Adresas", "Nuotrauka"]
      : role === "client"
        ? ["Vardas", "Rolė", "Apie įmonę", "Adresas", "Nuotrauka"]
        : ["Vardas", "Rolė"];

  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleChange = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 flex flex-col items-center text-center">
      <h1 className="text-3xl md:text-5xl font-bold dark:text-white mt-24 mb-12">
        Sveikas prisijungęs! Susipažinkime.
      </h1>

      <div className="flex flex-col items-center w-full max-w-md mt-6">
        <div className="relative w-full mb-[2px] h-8">
          <div className="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden z-0">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(step / stepLabels.length) * 100}%` }}
            />
          </div>

          <div className="flex w-full justify-between z-10 absolute top-0 left-0">
            {stepLabels.map((label, index) => (
              <div key={index} className="flex-1 flex justify-center">
                <span
                  className={`text-sm md:text-ld font-semibold transition-all ${step === index + 1
                    ? "text-blue-500 scale-110"
                    : "text-gray-500 dark:text-gray-300"
                    }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>

        <Card className="w-full min-h-[380px] px-6 py-8 shadow-lg text-left">
          <div className="w-full space-y-6">
            {step === 1 && (
              <OnboardingStepOneName
                formData={formData}
                onChange={handleChange}
                onNext={handleNext}
              />
            )}

            {step === 2 && (
              <OnboardingStepTwoRole
                formData={formData}
                onChange={handleChange}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );


}


