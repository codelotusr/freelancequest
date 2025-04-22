import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import { Card, Button } from "flowbite-react";
import toast from "react-hot-toast";
import {
  FaTasks,
  FaBriefcase,
  FaFire,
  FaTrophy,
  FaChartLine,
  FaCommentDots,
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUserTie,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import GigModal from "../components/GigModal";
import DeleteGigModal from "../components/DeleteGigModal"
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
      toast.success("Pasiūlymas sėkmingai sukurtas!");
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


  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-10 dark:text-white flex items-center gap-2">
          Sveiki sugrįžę, {user.username}!
        </h1>

        {user.role === "freelancer" && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaBriefcase /> Tavo darbai
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Vykdomi darbai čionais:(
              </p>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaTasks /> Rekomenduojami pasiūlymai
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Rekomenduojami pasiūlymai (arba tiesiog random lol)
              </p>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaFire /> Misijos
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Misijos, yay, xp, yay
              </p>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaTrophy /> Turnyrai
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                turnyyyrai, kodėl? nežinau, gal kieta
              </p>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaChartLine /> Lyderių lentelė
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                idk, gal ir nereikia, gal atskirai įdėti, aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa nežinau
              </p>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaCommentDots className="text-lg" />
                Atsiliepimai
              </h2>

              <p className="text-gray-600 dark:text-gray-300">
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaa
              </p>
            </Card>
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
                      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl p-6 shadow-md hover:shadow-xl ring-1 ring-transparent hover:ring-violet-500 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-2xl font-semibold text-white truncate">{gig.title}</h3>
                        <p className={`text-gray-400 text-base mt-2 truncate`}>
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

                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          size="xs"
                          color="yellow"
                          onClick={() => {
                            setSelectedGig(gig);
                            setIsGigModalOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <FaEdit className="text-xs" />
                          Redaguoti
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => setGigToDelete(gig)}
                          className="flex items-center gap-1"
                        >
                          <FaTrashAlt className="text-xs" />
                          Ištrinti
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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

          </>
        )}
      </main>
    </div>
  );
}

