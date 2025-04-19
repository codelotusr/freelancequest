import { Label, TextInput, Textarea, Button, Checkbox } from "flowbite-react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { FaBuilding, FaInfoCircle, FaGlobe } from "react-icons/fa";

interface Props {
  formData: OnboardingFormData
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStepThreeClient({
  formData,
  onChange,
  onNext,
  onBack,
}: Props) {
  const isBusiness = formData.is_business === true;

  const handleToggle = () => {
    const newState = !isBusiness;
    onChange({
      is_business: newState,
      ...(newState ? {} : { organization: "", website: "" }),
    });
  };


  const isValid = isBusiness
    ? !!formData.organization?.trim() && !!formData.business_description?.trim()
    : !!formData.business_description?.trim();


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Checkbox
          id="isBusiness"
          checked={isBusiness}
          onChange={handleToggle}
        />
        <Label htmlFor="isBusiness" className="cursor-pointer text-sm">
          Ar esate įmonės ar organizacijos atstovas?
        </Label>
      </div>

      {isBusiness && (
        <>
          <div>
            <Label htmlFor="organization" className="mb-1 flex items-center gap-2">
              <FaBuilding className="text-blue-500" /> Įmonės pavadinimas
            </Label>
            <TextInput
              id="organization"
              placeholder="pvz. UAB FreelanceQuest"
              value={formData.organization || ""}
              onChange={(e) => onChange({ organization: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="website" className="mb-1 flex items-center gap-2">
              <FaGlobe className="text-purple-500" /> Svetainė (nebūtina)
            </Label>
            <TextInput
              id="website"
              placeholder="pvz. https://freelancequest.lt"
              value={formData.website || ""}
              onChange={(e) => onChange({ website: e.target.value })}
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="business_description" className="mb-1 flex items-center gap-2">
          <FaInfoCircle className="text-green-500" /> Aprašykite savo poreikius
        </Label>
        <Textarea
          id="business_description"
          placeholder={
            isBusiness
              ? "Trumpai apie įmonės veiklą ar poreikius..."
              : "Aprašykite, kokių paslaugų ieškote"
          }
          rows={4}
          value={formData.business_description || ""}
          onChange={(e) => onChange({ business_description: e.target.value })}
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

