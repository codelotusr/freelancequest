import { useState, useEffect } from "react";
import api from "../services/axios";
import { Button, TextInput, Label } from "flowbite-react";
import { FaMoneyBillWave, FaClipboardCheck, FaUserTie } from "react-icons/fa";
import { useAuth } from "../context/useAuth";
import GigModal from "../components/GigModal";
import toast from "react-hot-toast";
import Select from "react-select";
import { getAllSkills } from "../services/skillsApi";
import { useDarkMode } from "../context/DarkModeProvider";
import { checkRecentMissions } from "../services/gamification";

export default function GigsPage() {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [selectedGig, setSelectedGig] = useState<any | null>(null);
  const [isGigModalOpen, setIsGigModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [skills, setSkills] = useState<{ label: string; value: number }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const { isDarkMode } = useDarkMode();
  const isDark = isDarkMode;


  const fetchGigs = async () => {
    try {
      const res = await api.get("/gigs/", {
        params: {
          status: "available",
          search,
          min_price: minPrice,
          skill_ids: selectedSkills,
        },
        paramsSerializer: (params) => {
          const query = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => query.append(key, v.toString()));
            } else if (value) {
              query.append(key, value.toString());
            }
          });
          return query.toString();
        },
      });
      setGigs(res.data);
    } catch (err) {
      console.error("Nepavyko gauti darbų:", err);
    }
  };

  useEffect(() => {
    fetchGigs();
    getAllSkills().then((res) => {
      const options = res.data.map((s: any) => ({
        label: s.name,
        value: s.id,
      }));
      setSkills(options);
    });
  }, []);

  const handleApply = async (gigId: number) => {
    try {
      await api.post(`/gigs/${gigId}/apply/`);
      toast.success("Paraiška pateikta!");
      await checkRecentMissions();
      fetchGigs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko pateikti paraiškos.");
    }
  };

  const handleCancelApplication = async (gigId: number) => {
    try {
      await api.delete(`/gigs/${gigId}/applications/${user?.pk}/`);
      toast.success("Paraiška atšaukta!");
      fetchGigs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Nepavyko atšaukti paraiškos.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Visi pasiūlymai</h1>

      <div className="grid gap-4 mb-8 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <Label htmlFor="search">Paieška</Label>
          <TextInput
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Įveskite pavadinimą arba aprašymą..."
          />
        </div>
        <div>
          <Label htmlFor="minPrice">Atlygis nuo (€)</Label>
          <TextInput
            id="minPrice"
            type="number"
            min="0"
            value={minPrice}
            placeholder="0"
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <Label>Įgūdžiai</Label>
          <Select
            options={skills}
            isMulti
            placeholder="Pasirinkite įgūdžius..."
            onChange={(selected) => {
              setSelectedSkills(selected.map((s) => s.value));
            }}
            className="react-select-container"
            classNamePrefix="react-select"
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
              multiValue: (base) => ({
                ...base,
                backgroundColor: "#fdba74",
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: "#7c2d12",
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
        <Button onClick={fetchGigs} className="col-span-full w-full sm:w-auto mt-2">
          Filtruoti
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {gigs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300 italic">Nėra pasiūlymų pagal pasirinktus filtrus.</p>
        ) : (
          gigs.map((gig) => (
            <div
              key={gig.id}
              className="flex flex-col justify-between bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:ring-2 hover:ring-violet-500"
            >
              <div className="mb-6 border-b border-gray-700 pb-4">
                <h3 className="text-2xl font-bold text-white truncate">{gig.title}</h3>
                <p className="text-gray-300 text-base mt-2 line-clamp-2">{gig.description}</p>
              </div>

              <div className="space-y-3 text-[15px] text-gray-300">
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-400" />
                  <span className="font-medium">{gig.price}€</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClipboardCheck className="text-blue-400" />
                  <span>{gig.status_display}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserTie className="text-purple-400" />
                  <span>{gig.client_name}</span>
                </div>
              </div>

              {user?.role === "freelancer" && (
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => {
                      setSelectedGig(gig);
                      setIsGigModalOpen(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    Peržiūrėti
                  </Button>

                  {user?.role === "freelancer" &&
                    (gig.already_applied ? (
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => handleCancelApplication(gig.id)}
                        className="flex items-center gap-1"
                      >
                        Atšaukti paraišką
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        color="green"
                        onClick={() => handleApply(gig.id)}
                        className="flex items-center gap-1"
                      >
                        Aplikuoti
                      </Button>
                    ))}
                </div>

              )}
            </div>
          ))
        )}
      </div>
      {isGigModalOpen && selectedGig && (
        <GigModal
          isOpen={isGigModalOpen}
          onClose={() => {
            setIsGigModalOpen(false);
            setSelectedGig(null);
          }}
          initialData={selectedGig}
          onSubmit={() => {
            setIsGigModalOpen(false);
            setSelectedGig(null);
            fetchGigs();
          }}
        />
      )}

    </div>
  );
}

