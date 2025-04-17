import React, { useState } from "react";
import { Card } from "flowbite-react";
import OnboardingStepOneName from "./OnboardingStepOneName";


export type Role = "freelancer" | "client";

export interface FormData {
  first_name: string;
  last_name: string;
  role: Role | "";
  profile_picture: File | null;
  // freelancer specifics
  bio?: string;
  skills?: string[];
  portfolio_links?: string[];
  // client specifics 
  organization?: string;
  business_description?: string;
  website?: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    role: "",
    profile_picture: null,
  });
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
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="absolute left-0 top-0 w-full flex justify-between z-10">
            <div className="flex flex-col items-center w-1/3">
              <span className={`text-base md:text-lg font-semibold transition-all ${step === 1 ? "text-blue-500 scale-110" : "text-gray-500 dark:text-gray-300"}`}>
                Vardas
              </span>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <span className={`text-base md:text-lg font-semibold transition-all ${step === 2 ? "text-blue-500 scale-110" : "text-gray-500 dark:text-gray-300"}`}>
                Idk
              </span>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <span className={`text-base md:text-lg font-semibold transition-all ${step === 3 ? "text-blue-500 scale-110" : "text-gray-500 dark:text-gray-300"}`}>
                Idk
              </span>
            </div>
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
          </div>
        </Card>
      </div>
    </div>
  );


}


