import {
  Modal,
  TextInput,
  Textarea,
  Label,
  Button,
  Avatar,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { FaGlobe, FaInfoCircle, FaBuilding, FaUserEdit, FaTools, FaLink } from "react-icons/fa";
import { HiPlus, HiTrash } from "react-icons/hi";
import Select from "react-select";
import { useDarkMode } from "../context/DarkModeProvider";
import { Skill } from "../types/profile";
import { getAllSkills } from "../services/skillsApi";
import { ProfileData } from "../types/profile";
import toast from "react-hot-toast";


interface Props {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (formData: FormData) => Promise<void>;
}

export default function EditProfileModal({ open, onClose, profile, onSave }: Props) {
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [bio, setBio] = useState(profile.freelancer_profile?.bio || "");
  const [skills, setSkills] = useState<number[]>(profile.freelancer_profile?.skills.map(s => s.id) || []);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(profile.freelancer_profile?.portfolio_links || []);
  const [organization, setOrganization] = useState(profile.client_profile?.organization || "");
  const [website, setWebsite] = useState(profile.client_profile?.website || "");
  const [businessDescription, setBusinessDescription] = useState(profile.client_profile?.business_description || "");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.profile_picture);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [newLink, setNewLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDarkMode } = useDarkMode();
  const isDark = isDarkMode;

  useEffect(() => {
    getAllSkills()
      .then(res => setAvailableSkills(res.data))
      .catch(() => toast.error("Failed to load skills"));
  }, []);

  useEffect(() => {
    if (pictureFile) {
      const url = URL.createObjectURL(pictureFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [pictureFile]);

  const handleSubmit = async () => {
    const form = new FormData();
    form.append("first_name", firstName);
    form.append("last_name", lastName);
    if (pictureFile) form.append("profile_picture", pictureFile);

    if (profile.role === "freelancer") {
      form.append("freelancer_profile.bio", bio);
      form.append("freelancer_profile.skills", JSON.stringify(skills));
      form.append("freelancer_profile.portfolio_links", JSON.stringify(portfolioLinks));
    } else if (profile.role === "client") {
      form.append("client_profile.organization", organization);
      form.append("client_profile.website", website);
      form.append("client_profile.business_description", businessDescription);
    }

    setIsSubmitting(true);
    try {
      await onSave(form);
      toast.success("Profilis atnaujintas sėkmingai!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSkills = availableSkills.filter((s) => skills.includes(s.id));
  const skillOptions = availableSkills
    .filter((s) => !skills.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name }));

  const removeSkill = (id: number) => {
    setSkills((prev) => prev.filter((s) => s !== id));
  };

  const handleAddLink = () => {
    const trimmed = newLink.trim();
    if (trimmed && !portfolioLinks.includes(trimmed)) {
      setPortfolioLinks([...portfolioLinks, trimmed]);
      setNewLink("");
    }
  };

  return (
    <Modal show={open} onClose={onClose}>
      <div className="p-6 bg-gray-900 rounded-lg text-white max-w-2xl w-full mx-auto space-y-6">

        <h2 className="text-xl font-bold text-white">Redaguoti Profilį</h2>

        <div className="flex items-center gap-4">
          <Avatar img={previewUrl} rounded size="xl" />
          <div className="flex flex-col gap-2">
            <Label htmlFor="profilePicture">Profilio nuotrauka</Label>

            <div className="flex items-center gap-4">
              <label
                htmlFor="profilePicture"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer text-sm"
              >
                Pasirinkti failą
              </label>

              <span className="text-sm text-gray-400">
                {pictureFile?.name || "Failas nepasirinktas"}
              </span>
            </div>

            <input
              type="file"
              id="profilePicture"
              accept="image/png, image/jpeg"
              onChange={(e) => setPictureFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

        </div>

        <div>
          <Label>Vardas</Label>
          <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div>
          <Label>Pavardė</Label>
          <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        {profile.role === "freelancer" && (
          <>
            <div>
              <Label className="flex gap-2 items-center"><FaUserEdit /> Aprašymas</Label>
              <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div>
              <Label className="flex gap-2 items-center"><FaTools /> Įgūdžiai</Label>
              <Select
                options={skillOptions}
                placeholder="Surasti įgūdžius..."
                value={null}
                onChange={(selected) => selected && setSkills([...skills, selected.value])}
                isSearchable
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
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="flex items-center gap-1 bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {skill.name}
                    <button
                      onClick={() => removeSkill(skill.id)}
                      className="hover:text-red-300 text-red-500"
                    >
                      <HiTrash className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label className="flex gap-2 items-center"><FaLink /> Portfolio Nuorodos</Label>
              <div className="flex gap-2">
                <TextInput
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                />
                <Button size="sm" onClick={handleAddLink}><HiPlus /> Add</Button>
              </div>
              <ul className="mt-2 space-y-1">
                {portfolioLinks.map((link) => (
                  <li key={link} className="flex justify-between items-center text-sm bg-gray-800 px-3 py-2 rounded">
                    <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 truncate">{link}</a>
                    <button onClick={() => setPortfolioLinks(portfolioLinks.filter((l) => l !== link))}>
                      <HiTrash className="text-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {profile.role === "client" && (
          <>
            <div>
              <Label className="flex gap-2 items-center"><FaBuilding /> Organizacija</Label>
              <TextInput value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </div>
            <div>
              <Label className="flex gap-2 items-center"><FaGlobe /> Puslapis</Label>
              <TextInput value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <div>
              <Label className="flex gap-2 items-center"><FaInfoCircle /> Aprašymas</Label>
              <Textarea rows={4} value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <Button color="gray" onClick={onClose}>
            Atšaukti
          </Button>
          <Button color="blue" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Išsaugoma..." : "Išsaugoti"}
          </Button>
        </div>

      </div>
    </Modal>
  );
}

