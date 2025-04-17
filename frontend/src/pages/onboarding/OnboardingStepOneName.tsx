import React from "react";
import { Label, TextInput, Button } from "flowbite-react";
import { FormData } from "./OnboardingPage";
import { HiOutlineUser } from "react-icons/hi";

interface Props {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  onNext: () => void;
}

export default function OnboardingStepOneName({ formData, onChange, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <HiOutlineUser className="text-6xl text-blue-500 dark:text-blue-400 mb-2" />

      <div className="w-full text-left flex flex-col gap-4">
        <div>
          <Label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-200">
            Vardas
          </Label>
          <TextInput
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
            required
            placeholder="pvz. Jonas"
          />
        </div>

        <div>
          <Label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-200">
            Pavardė
          </Label>
          <TextInput
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            required
            placeholder="pvz. Smaliuks"
          />
        </div>

        <Button onClick={onNext} className="mt-2">
          Toliau
        </Button>
      </div>
    </div>
  );
}

