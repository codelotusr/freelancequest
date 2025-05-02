import { Label, Textarea, TextInput, Button } from "flowbite-react";
import { OnboardingFormData } from "../../components/OnboardingFormData";
import { useEffect, useState } from "react";
import { getAllSkills } from "../../services/skillsApi";
import { FaTools, FaLink, FaUserEdit } from "react-icons/fa";
import { HiPlus, HiTrash } from "react-icons/hi";
import Select from "react-select";

interface Skill {
  id: number;
  name: string;
}

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
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [portfolioInput, setPortfolioInput] = useState("");

  useEffect(() => {
    getAllSkills()
      .then((res) => setAvailableSkills(res.data))
      .catch((err) => console.error("Failed to load skills", err));
  }, []);

  const addSkill = (skillId: number) => {
    if (!formData.skills?.includes(skillId)) {
      onChange({ skills: [...(formData.skills || []), skillId] });
    }
  };

  const removeSkill = (id: number) => {
    onChange({
      skills: formData.skills?.filter((s) => s !== id),
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

  const selectedSkills = availableSkills.filter((s) =>
    formData.skills?.includes(s.id)
  );

  const skillOptions = availableSkills
    .filter((s) => !formData.skills?.includes(s.id))
    .map((skill) => ({
      value: skill.id,
      label: skill.name,
    }));

  const isDark = document.documentElement.classList.contains("dark");

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
          <FaTools className="text-green-500" /> Pasirink įgūdžius
        </Label>
        <div className="mb-2">
          <Select
            options={skillOptions}
            placeholder="Ieškoti įgūdžio..."
            value={null}
            isSearchable
            onChange={(selected) => {
              if (selected) addSkill(selected.value);
            }}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: isDark ? "#374151" : "#f9fafb",
                color: isDark ? "white" : "black",
                boxShadow: "none",
                fontSize: "0.875rem",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: isDark ? "#1f2937" : "white",
                color: isDark ? "white" : "black",
                zIndex: 100,
              }),
              singleValue: (base) => ({
                ...base,
                color: isDark ? "white" : "black",
              }),
              input: (base) => ({
                ...base,
                color: isDark ? "white" : "black",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? isDark
                    ? "#374151"
                    : "#eff6ff"
                  : isDark
                    ? "#1f2937"
                    : "white",
                color: isDark ? "white" : "black",
                cursor: "pointer",
              }),
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 6,
              colors: {
                ...theme.colors,
                primary25: isDark ? "#374151" : "#eff6ff",
                primary: "#3b82f6",
              },
            })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full"
            >
              {skill.name}
              <button
                onClick={() => removeSkill(skill.id)}
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

