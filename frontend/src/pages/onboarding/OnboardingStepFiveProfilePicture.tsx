import { Button, Avatar } from "flowbite-react";
import { useState, useEffect, DragEvent } from "react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { HiUpload } from "react-icons/hi";

interface Props {
  formData: OnboardingFormData;
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onFinish: () => void;
  onBack: () => void;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function OnboardingStepFiveProfilePicture({
  formData,
  onChange,
  onFinish,
  onBack,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (formData.profile_picture) {
      const objectUrl = URL.createObjectURL(formData.profile_picture);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [formData.profile_picture]);

  const validateFile = (file: File | null): boolean => {
    if (!file) return false;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Nepalaikomas failo formatas. Leistini: PNG, JPG, JPEG.");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError("Failas per didelis. Maksimalus dydis: 5 MB.");
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (file: File | null) => {
    if (validateFile(file)) {
      onChange({ profile_picture: file });
    } else {
      onChange({ profile_picture: null });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const isValid = !!formData.profile_picture;

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <h2 className="text-2xl font-semibold dark:text-white flex items-center gap-2">
        <HiUpload className="text-blue-500 text-3xl" />
        Įkelkite profilio nuotrauką
      </h2>

      {previewUrl ? (
        <Avatar img={previewUrl} rounded size="xl" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-300 text-sm">Nėra nuotraukos</span>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border border-dashed border-blue-500 dark:border-blue-300 rounded-md p-6 w-full text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-800 transition"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          Nutempkite nuotrauką čia arba pasirinkite failą
        </p>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="mx-auto block"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
        <div className="flex-1">
          <Button color="gray" onClick={onBack} className="w-full">
            Atgal
          </Button>
        </div>
        <div className="flex-1">
          <Button onClick={onFinish} disabled={!isValid} className="w-full">
            Baigti
          </Button>

        </div>
      </div>
    </div>
  );
}

