import { Label, TextInput, Textarea, Button } from "flowbite-react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { useState } from "react";
import { FaTools, FaLink, FaUserEdit } from "react-icons/fa";
import { HiPlus, HiTrash } from "react-icons/hi";

interface Props {
  formData: OnboardingFormData;
  onChange: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStepThreeFreelancer({
  formData,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [skillInput, setSkillInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills?.includes(trimmed)) {
      onChange({
        skills: [...(formData.skills || []), trimmed],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    onChange({
      skills: formData.skills?.filter((s) => s !== skill),
    });
  };

  const addPortfolio = () => {
    const trimmed = portfolioInput.trim();
    if (trimmed && !formData.portfolio_links?.includes(trimmed)) {
      onChange({
        portfolio_links: [...(formData.portfolio_links || []), trimmed],
      });
      setPortfolioInput("");
    }
  };

  const removePortfolio = (link: string) => {
    onChange({
      portfolio_links: formData.portfolio_links?.filter((l) => l !== link),
    });
  };

  const isValid =
    (formData.skills?.length ?? 0) > 0 && (formData.bio?.trim().length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label htmlFor="bio" className="mb-1 flex items-center gap-2">
          <FaUserEdit className="text-blue-500" /> Trumpas aprašymas apie tave
        </Label>
        <Textarea
          id="bio"
          placeholder="Papasakok apie save..."
          value={formData.bio || ""}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="skills" className="mb-1 flex items-center gap-2">
          <FaTools className="text-green-500" /> Įgūdžiai
        </Label>
        <div className="flex gap-2 mb-2 w-full">
          <TextInput
            id="skills"
            placeholder="pvz. Grafinis dizainas"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="flex-1"
          />
          <Button onClick={addSkill} color="blue" className="shrink-0 h-10 px-4">
            <HiPlus className="mr-1" /> Pridėti
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills?.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-red-400 hover:text-red-600"
              >
                <HiTrash />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="portfolio_links" className="mb-1 flex items-center gap-2">
          <FaLink className="text-purple-500" /> Portfolio nuorodos (nebūtina)
        </Label>
        <div className="flex gap-2 mb-2 w-full">
          <TextInput
            id="portfolio_links"
            placeholder="https://..."
            value={portfolioInput}
            onChange={(e) => setPortfolioInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPortfolio())}
            className="flex-1"
          />
          <Button onClick={addPortfolio} color="blue" className="h-10 px-4">
            <HiPlus className="mr-1" /> Pridėti
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {formData.portfolio_links?.map((link) => (
            <div
              key={link}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded"
            >
              <span className="truncate">{link}</span>
              <button
                onClick={() => removePortfolio(link)}
                className="text-red-500 hover:text-red-700"
              >
                <HiTrash />
              </button>
            </div>
          ))}
        </div>
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

