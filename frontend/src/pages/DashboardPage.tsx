import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import { Card, Button } from "flowbite-react";
import toast from "react-hot-toast";
import {
  FaBriefcase,
  FaFire,
  FaCommentDots,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUserTie,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import GigModal from "../components/GigModal";
import DeleteGigModal from "../components/DeleteGigModal"
import ApplicantsModal from "../components/ApplicantsModal";
import api from "../services/axios";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [gigs, setGigs] = useState<any[]>([]);
  const fetchGigs = async () => {
    const res = await api.get("/gigs/");
    setGigs(res.data);
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const [isGigModalOpen, setIsGigModalOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState<any | null>(null);
  const [gigToDelete, setGigToDelete] = useState<any | null>(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [selectedApplicantsGig, setSelectedApplicantsGig] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<"usersGigs" | "usersApplications" | "usersMissions" | "usersReviews" | null>(null);

  const handleGigSubmit = async (gigData: {
    title: string;
    description: string;
    price: number;
    id?: number;
  }) => {
    try {
      if (gigData.id) {
        await api.patch(`/gigs/${gigData.id}/`, gigData);
        toast.success("Pasiūlymas atnaujintas!");
      } else {
        await api.post("/gigs/", gigData);
        toast.success("Pasiūlymas sėkmingai sukurtas!");
      }
      await fetchGigs();
      setIsGigModalOpen(false);
      console.log("Gig created:", gigData);
    } catch (err) {
      console.error("Error while creating the gig:", err);
      toast.error("Pasiūlymo sukurti nepavyko")
    }
  };

  const confirmGigDelete = async () => {
    if (!gigToDelete) return;
    try {
      await api.delete(`/gigs/${gigToDelete.id}/`);
      toast.success("Pasiūlymas ištrintas");
      setGigToDelete(null);
      await fetchGigs();
    } catch (err) {
      console.error("Error while deleting the gig:", err);
      toast.error("Nepavyko ištrinti pasiūlymo");
    }
  };

  const handleConfirmFreelancer = async (freelancerId: number) => {
    if (!selectedApplicantsGig) return;
    try {
      await api.post(`/gigs/${selectedApplicantsGig.id}/confirm/`, {
        freelancer_id: freelancerId,
      });
      toast.success("Specialistas pasirinktas!");
      setIsApplicantsModalOpen(false);
      await fetchGigs();
    } catch (err) {
      toast.error("Nepavyko pasirinkti specialisto");
      console.error(err);
    }
  };

  const handleRejectApplication = async (freelancerId: number) => {
    try {
      await api.delete(`/gigs/${selectedGig.id}/applications/${freelancerId}/`);
      toast.success("Paraiška atmesta");
      await fetchGigs();
    } catch (err) {
      toast.error("Nepavyko atmesti paraiškos");
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-10 dark:text-white flex items-center gap-2">
          Sveiki sugrįžę, {user.username}!
        </h1>

        {user.role === "freelancer" && (
          <div className="space-y-10">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Vykdomi darbai",
                  icon: <FaBriefcase className="text-blue-500 text-2xl" />,
                  description: "Čia matysi visus darbus, kuriuos šiuo metu vykdai.",
                  buttonText: "Peržiūrėti darbus",
                  buttonColor: "blue",
                  modalType: "usersGigs",
                },
                {
                  title: "Tavo paraiškos",
                  icon: <FaClipboardCheck className="text-purple-500 text-2xl" />,
                  description: "Peržiūrėk pasiūlymus, į kuriuos esi pateikęs paraiškas.",
                  buttonText: "Peržiūrėti paraiškas",
                  buttonColor: "purple",
                  modalType: "usersApplications",
                },
                {
                  title: "Misijos",
                  icon: <FaFire className="text-red-500 text-2xl" />,
                  description: "Galll čia rodyti daily misijas, hmm",
                  buttonText: "Peržiūrėti misijas",
                  buttonColor: "green",
                  modalType: "usersMissions",
                },
                {
                  title: "Atsiliepimai",
                  icon: <FaCommentDots className="text-yellow-500 text-2xl" />,
                  description: "Peržiūrėk klientų atsiliepimus apie savo darbus.",
                  buttonText: "Peržiūrėti atsiliepimus",
                  buttonColor: "gray",
                  modalType: "usersReviews",
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:ring-2 hover:ring-violet-500"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {card.icon}
                    <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-8 text-[15px]">{card.description}</p>
                  <Button
                    color={card.buttonColor as any}
                    onClick={() => setActiveModal(card.modalType)}
                    className="w-full text-sm py-2"
                  >
                    {card.buttonText}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.role === "client" && (
          <>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaBriefcase /> Jūsų pasiūlymai
              </h2>

              {gigs.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {gigs.map((gig) => (
                    <div
                      key={gig.id}
                      className="flex flex-col justify-between bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 hover:ring-2 hover:ring-violet-500"
                    >
                      <div className="mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-2xl font-bold text-white truncate">{gig.title}</h3>
                        <p className="text-gray-300 text-base mt-2 truncate">
                          {gig.description}
                        </p>
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
                          <span>{gig.freelancer_name || "—"}</span>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <div className="flex gap-2 w-full sm:w-auto">
                          {gig.applications?.length > 0 && (
                            <Button
                              color="purple"
                              size="xs"
                              onClick={() => {
                                setSelectedApplicantsGig(gig);
                                setIsApplicantsModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5"
                            >
                              <FaUserTie className="text-sm" />
                              Paraiškos
                            </Button>
                          )}

                          <Button
                            color="yellow"
                            size="xs"
                            onClick={() => {
                              setSelectedGig(gig);
                              setIsGigModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5"
                          >
                            <FaEdit className="text-sm" />
                            Redaguoti
                          </Button>

                          <Button
                            color="red"
                            size="xs"
                            onClick={() => setGigToDelete(gig)}
                            className="flex items-center gap-1 px-3 py-1.5"
                          >
                            <FaTrashAlt className="text-sm" />
                            Ištrinti
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Kol kas nepaskelbėte jokių pasiūlymų.
                </p>
              )}

            </div>

            <Button
              onClick={() => setIsGigModalOpen(true)}
              className="w-full mt-6 bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:brightness-110 transition duration-300 ease-in-out"
            >
              Sukurti pasiūlymą
            </Button>

            <GigModal
              isOpen={isGigModalOpen}
              onClose={() => {
                setIsGigModalOpen(false);
                setSelectedGig(null);
              }}
              onSubmit={handleGigSubmit}
              initialData={selectedGig}
            />

            <DeleteGigModal
              isOpen={!!gigToDelete}
              onClose={() => setGigToDelete(null)}
              onConfirm={confirmGigDelete}
              gigTitle={gigToDelete?.title}
            />

            <ApplicantsModal
              gig={selectedApplicantsGig}
              isOpen={isApplicantsModalOpen}
              onClose={() => setIsApplicantsModalOpen(false)}
              onConfirm={handleConfirmFreelancer}
              onReject={handleRejectApplication}
            />

          </>
        )}
      </main>
    </div>
  );
}

