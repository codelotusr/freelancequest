import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "flowbite-react";
import {
  FaTasks,
  FaBriefcase,
  FaFire,
  FaTrophy,
  FaChartLine,
  FaCommentDots,
} from "react-icons/fa";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-10 dark:text-white flex items-center gap-2">
          Sveikas sugrįžęs, {user.username}!
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                <FaTasks /> Paskelbk naują pasiūlymą
              </h2>
              <Button
                onClick={() => navigate("/gigs/new")}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                Sukurti pasiūlymą
              </Button>
            </Card>

            <Card className="h-full flex flex-col justify-between">
              <h2 className="text-xl font-semibold mb-2 dark:text-white flex items-center gap-2">
                <FaBriefcase /> Tavo paskutiniai pasiūlymai
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                darbai ir jų statusas, ig
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

