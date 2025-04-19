import { Label, TextInput, Button } from "flowbite-react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { HiOutlineUser } from "react-icons/hi";
import { useState } from "react";

interface Props {
  formData: OnboardingFormData;
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

export default function OnboardingStepOneName({ formData, onChange, onNext }: Props) {
  const [errors, setErrors] = useState({ first_name: "", last_name: "", username: "", });

  const handleContinue = async () => {
    const newErrors = {
      first_name: formData.first_name.trim() ? "" : "Vardas yra privalomas",
      last_name: formData.last_name.trim() ? "" : "Pavardė yra privaloma",
      username: formData.username.trim() ? "" : "Slapyvardis yra privalomas",
    };

    setErrors(newErrors);

    const hasClientErrors = Object.values(newErrors).some((err) => err !== "");
    if (hasClientErrors) return;

    try {
      const res = await fetch(
        `/api/users/check-username/?username=${formData.username.trim()}`
      );
      if (!res.ok) {
        throw new Error("Toks slapyvardis jau užimtas ar rezervuotas.");
      }

      onNext();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        username: "Toks slapyvardis jau užimtas ar rezervuotas.",
      }));
      console.error(err);
    }
  };


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
            placeholder="pvz. Deividas"
            color={errors.first_name ? "failure" : undefined}
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-200">
            Pavardė
          </Label>
          <TextInput
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="pvz. Smaliukas"
            color={errors.last_name ? "failure" : undefined}
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-200">
            Slapyvardis
          </Label>
          <TextInput
            id="username"
            value={formData.username}
            onChange={(e) => onChange({ username: slugify(e.target.value) })}
            placeholder="pvz. deividas-smaliukas"
            color={errors.username ? "failure" : undefined}
          />
          {formData.username && (
            <p className="mt-1 text-sm text-gray-400">
              Bus matoma kaip: <code>{formData.username}</code>
            </p>
          )}
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        <Button
          onClick={handleContinue}
          disabled={
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.username.trim()
          }
          className="mt-2"
        >
          Toliau
        </Button>
      </div>
    </div>
  );
}
