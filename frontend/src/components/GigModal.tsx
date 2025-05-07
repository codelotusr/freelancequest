import { Modal, Button, Label, TextInput, Textarea, Datepicker } from "flowbite-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { getAllSkills } from "../services/skillsApi";
import { useDarkMode } from "../context/DarkModeProvider";

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
          const initial = options.filter((opt) =>
            initialData.skills!.some((s) => s.id === opt.value)
          );
          setSelectedSkills(initial);
        }
      })
      .catch((err) => console.error("Failed to fetch skills", err));
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!title || !description || !price) return;

    setIsSubmitting(true);
    await onSubmit({
      id: initialData?.id,
      title,
      description,
      price: parseFloat(price),
      skill_ids: selectedSkills.map((s) => s.value),
      due_date: dueDate?.toISOString().split("T")[0],
    });
    setIsSubmitting(false);
    setTitle("");
    setDescription("");
    setPrice("");
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isFreelancer ? "Darbo pasiūlymo informacija" : isClientOwner ? "Redaguoti pasiūlymą" : "Darbo pasiūlymo peržiūra"}
        </h3>

        <div>
          <Label>Pavadinimas</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{title}</p>
          ) : (
            <TextInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pvz. Reikia svetainės dizaino"
              required
            />
          )}
        </div>

        <div>
          <Label>Aprašymas</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{description}</p>
          ) : (
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Trumpas darbo aprašymas..."
              rows={4}
              required
            />
          )}
        </div>

        <div>
          <Label>Atlyginimas (€)</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{price}€</p>
          ) : (
            <TextInput
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="100"
              required
            />
          )}
        </div>

        <div>
          <Label>Terminas</Label>
          {isFreelancer ? (
            <p className="text-gray-200">{dueDate?.toLocaleDateString("lt-LT") || "Nenurodyta"}</p>
          ) : (
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
          )}
        </div>


        {!isFreelancer && (
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



        )}


        {isFreelancer && initialData?.client_name && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">Klientas:</span>
            <button
              onClick={() => navigate(`/profile/${initialData.client_username}`)}
              className="text-blue-400 hover:underline"
            >
              {initialData.client_name}
            </button>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose}>
            {isFreelancer ? "Uždaryti" : "Atšaukti"}
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

