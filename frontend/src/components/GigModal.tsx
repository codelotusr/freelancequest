import { Modal, Button, Label, TextInput, Textarea, Datepicker } from "flowbite-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { getAllSkills } from "../services/skillsApi";
import { useDarkMode } from "../context/DarkModeProvider";
import { FaMoneyBillWave, FaCalendarAlt, FaUserTie, FaTags, FaFileDownload, FaFileUpload } from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../services/axios";

interface GigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    price: number;
    id?: number;
    skills?: number[];
    skill_ids: number[];
    due_date?: string;
  }) => Promise<void>;
  initialData?: {
    id?: number;
    title: string;
    description: string;
    price: number;
    client_name?: string;
    client_username?: string;
    client_id?: number;
    client?: number;
    freelancer?: number;
    freelancer_name?: string;
    freelancer_username?: string;
    due_date?: string;
    skills?: { id: number; name: string }[];
  };
}

interface SkillOption {
  label: string;
  value: number;
}

export default function GigModal({ isOpen, onClose, onSubmit, initialData }: GigModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFreelancer = user?.role === "freelancer";
  const isClient = user?.role === "client";
  const isClientOwner = user?.role === "client" && user?.pk === initialData?.client;

  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const { isDarkMode } = useDarkMode();
  const isDark = isDarkMode;

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [instructionFiles, setInstructionFiles] = useState<File[]>([]);
  const [instructionDesc, setInstructionDesc] = useState("");


  useEffect(() => {
    setTitle(initialData?.title || "");
    setDescription(initialData?.description || "");
    setPrice(initialData?.price?.toString() || "");

    if (initialData?.due_date) {
      const parsedDate = new Date(initialData.due_date);
      if (!isNaN(parsedDate.getTime())) {
        setDueDate(parsedDate);
      } else {
        setDueDate(null);
      }
    } else {
      setDueDate(null);
    }

    getAllSkills()
      .then((res) => {
        const options = res.data.map((skill: any) => ({
          label: skill.name,
          value: skill.id,
        }));
        setAvailableSkills(options);

        if (initialData?.skills) {
          const initial = options.filter((opt: SkillOption) =>
            initialData.skills!.some((s) => s.id === opt.value)
          );
          setSelectedSkills(initial);
        }
      })
      .catch((err) => console.error("Failed to fetch skills", err));

    if (initialData?.id && isFreelancer) {
      api.get(`/gigs/${initialData.id}/submissions/`).then((res: any) =>
        setSubmissions(res.data)
      );
    }

    if (initialData?.id) {
      api.get(`/gigs/${initialData.id}/instructions/`).then((res: any) =>
        setInstructions(res.data)
      );
    }
  }, [initialData, isOpen]);


  const handleSubmit = async () => {
    if (!title || !description || !price || !dueDate) return;

    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        id: initialData?.id,
        title,
        description,
        price: parseFloat(price),
        skill_ids: selectedSkills.map((s) => s.value),
        due_date: dueDate.toISOString().split("T")[0],
      });

      const gigId = initialData?.id || result?.id;
      if (instructionFiles.length > 0 && instructionDesc && gigId) {
        for (const file of instructionFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("description", instructionDesc);
          await api.post(`/gigs/${gigId}/submit-instruction/`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
      }

      onClose();

      setTitle("");
      setDescription("");
      setPrice("");
      setInstructionFiles([]);
      setInstructionDesc("");
    } catch (error) {
      toast.error("Nepavyko išsaugoti pasiūlymo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="lg">
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isFreelancer
            ? "Darbo pasiūlymo informacija"
            : isClientOwner
              ? "Redaguoti pasiūlymą"
              : "Darbo pasiūlymo peržiūra"}
        </h3>

        {isFreelancer ? (
          <>

            <div className="space-y-5 text-sm text-gray-200">
              <div>
                <span className="block font-medium text-gray-400">Pavadinimas</span>
                <p className="text-lg font-semibold text-white">{title}</p>
              </div>
              <div>
                <span className="block font-medium text-gray-400">Aprašymas</span>
                <p className="whitespace-pre-line">{description}</p>
              </div>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-400" />
                  <p>{price} €</p>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <p>{dueDate?.toLocaleDateString("lt-LT") || "Nenurodyta"}</p>
                </div>
              </div>
              {initialData?.skills && initialData.skills.length > 0 && (
                <div>
                  <span className="block font-medium text-gray-400 mb-1 flex items-center gap-2">
                    <FaTags className="text-yellow-400" /> Reikalingi įgūdžiai
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {initialData.skills.map((skill) => (
                      <li
                        key={skill.id}
                        className="bg-blue-800 text-white text-xs font-medium px-3 py-1 rounded-full"
                      >
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {initialData?.client_name && (
                <div className="flex items-center gap-2">
                  <FaUserTie className="text-purple-400" />
                  <span className="font-medium text-white">Klientas:</span>
                  <button
                    onClick={() => navigate(`/profile/${initialData.client_username}`)}
                    className="text-blue-400 hover:underline"
                  >
                    {initialData.client_name}
                  </button>
                </div>
              )}
            </div>
            {submissions.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mt-6">Pateikti darbai</h4>
                {submissions.map((submission) => (
                  <div key={submission.id} className="mt-2 p-3 rounded-md bg-gray-700 text-sm space-y-1">
                    <p className="text-gray-300">
                      <strong>Data:</strong> {new Date(submission.submitted_at).toLocaleString("lt-LT")}
                    </p>
                    <p className="text-gray-300">
                      <strong>Komentaras:</strong>{" "}
                      {submission.message || <span className="italic">nėra</span>}
                    </p>
                    {submission.file && (
                      <a
                        href={submission.file}
                        download
                        className="text-blue-400 hover:underline"
                      >
                        Atsisiųsti failą
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <Label>Pavadinimas</Label>
              <TextInput
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="pvz. Reikia svetainės dizaino"
                required
              />
            </div>

            <div>
              <Label>Aprašymas</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Trumpas darbo aprašymas..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label>Atlyginimas (€)</Label>
              <TextInput
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100"
                required
              />
            </div>

            <div>
              <Label>Terminas</Label>
              <Datepicker
                language="lt"
                labelTodayButton="Šiandien"
                labelClearButton="Išvalyti"
                value={dueDate || undefined}
                onChange={(date: Date | null) => {
                  console.log("selected date:", date);
                  setDueDate(date);
                }}
                weekStart={1}
                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full"
                theme={{
                  root: {
                    base: "relative",
                  },
                  popup: {
                    root: {
                      base:
                        "z-50 block absolute inset-0 mt-12 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800",
                    },
                  },
                  views: {
                    days: {
                      header: {
                        base: "mb-1 grid grid-cols-7",
                        title: "h-6 text-center text-sm font-medium leading-6 text-gray-500 dark:text-gray-400",
                      },
                      items: {
                        base: "grid w-64 grid-cols-7",
                        item: {
                          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600",
                          selected: "bg-cyan-700 text-white hover:bg-cyan-600",
                          disabled: "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500 hover:bg-transparent dark:hover:bg-transparent",
                        },
                      },
                    },
                    months: {
                      items: {
                        base: "grid w-64 grid-cols-4",
                        item: {
                          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600",
                          selected: "bg-cyan-700 text-white hover:bg-cyan-600",
                          disabled: "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500 hover:bg-transparent dark:hover:bg-transparent",
                        },
                      },
                    },
                    years: {
                      items: {
                        base: "grid w-64 grid-cols-4",
                        item: {
                          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600",
                          selected: "bg-cyan-700 text-white hover:bg-cyan-600",
                          disabled: "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500 hover:bg-transparent dark:hover:bg-transparent",
                        },
                      },
                    },
                    decades: {
                      items: {
                        base: "grid w-64 grid-cols-4",
                        item: {
                          base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600",
                          selected: "bg-cyan-700 text-white hover:bg-cyan-600",
                          disabled: "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-500 hover:bg-transparent dark:hover:bg-transparent",
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            <div>
              <Label>Reikalingi įgūdžiai</Label>
              <Select
                options={availableSkills}
                value={selectedSkills}
                onChange={(selected) => setSelectedSkills(selected as SkillOption[])}
                isMulti
                placeholder="Ieškoti ir pasirinkti įgūdžius..."
                isSearchable
                className="text-black dark:text-white"
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
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#fdba74",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: "#7c2d12",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: "#c2410c",
                    ":hover": {
                      backgroundColor: "#fb923c",
                      color: "white",
                    },
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
          </>
        )}

        {isClient && (
          <div className="mt-8 space-y-3">
            <h4 className="text-md font-bold text-white">📤 Įkelti instrukciją darbuotojui</h4>

            <div>
              <Label className="text-sm text-white mb-1">Aprašymas</Label>
              <TextInput
                placeholder="Trumpas instrukcijos aprašymas"
                value={instructionDesc}
                onChange={(e) => setInstructionDesc(e.target.value)}
                className="text-sm"
              />
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFiles = Array.from(e.dataTransfer.files || []);
                setInstructionFiles((prev) => [...prev, ...droppedFiles]);
              }}
              className="border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors duration-200 rounded-lg p-6 text-center text-sm text-gray-300 bg-gray-800 cursor-pointer"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                id="fileInput"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  setInstructionFiles((prev) => [...prev, ...selected]);
                }}
              />
              <FaFileUpload className="mx-auto text-2xl mb-2 text-blue-400" />
              <span>
                Drag & drop arba spauskite, kad pasirinkti{" "}
                <strong>daugiau nei vieną failą</strong>
              </span>
            </div>

            {instructionFiles.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm text-white mb-2">Pasirinkti failai:</Label>
                <ul className="space-y-1 text-sm text-gray-100 list-disc list-inside max-h-32 overflow-y-auto pr-2">
                  {instructionFiles.map((file, index) => (
                    <li key={index} className="truncate">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}



        {(isClientOwner || user?.pk === initialData?.freelancer) && instructions.length > 0 ? (
          <div className="mt-8">
            <h4 className="text-lg font-bold text-white mb-2">Pateiktos instrukcijos</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {instructions.map((instr) => (
                <div
                  key={instr.id}
                  className="rounded-lg border border-gray-600 bg-gray-800 p-3 shadow-sm"
                >
                  <p className="text-gray-300 font-medium mb-1">{instr.description}</p>
                  <a
                    href={instr.file}
                    download
                    className="text-blue-400 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    <FaFileDownload className="inline-block" /> Atsisiųsti failą
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : isFreelancer && user?.pk === initialData?.freelancer ? (
          <p className="text-sm text-gray-400 italic mt-6">Nėra pateiktų instrukcijų.</p>
        ) : null}

        <div className="mt-10 flex justify-end items-center gap-4 border-t border-gray-700 pt-6">
          <Button color="gray" onClick={onClose}>
            Atšaukti
          </Button>

          {isClient && (
            <Button
              disabled={isSubmitting || !title || !description || !price || !dueDate}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Išsaugoma..." : initialData ? "Atnaujinti" : "Sukurti"}
            </Button>
          )}
        </div>


      </div>
    </Modal>
  );
}

