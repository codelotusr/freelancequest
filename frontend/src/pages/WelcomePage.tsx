import { Button, Navbar } from "flowbite-react";
import { Link } from "react-router-dom";
import { Trophy, Users, TrendingUp } from "lucide-react";
import DarkModeToggle from "../components/DarkModeToggle"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navbar fluid rounded className="shadow-md px-4 dark:bg-gray-900 dark:text-white">
        <Link
          to="/"
          className="text-xl font-semibold whitespace-nowrap text-blue-700 dark:text-white"
        >
          FreelanceQuest
        </Link>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Link to="/register">
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              Registruotis
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="sm"
              outline
              className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-white dark:text-white dark:hover:bg-gray-700"
            >
              Prisijungti
            </Button>
          </Link>
        </div>
      </Navbar>

      <main className="flex flex-col items-center justify-center flex-1 px-4 py-12">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Sveiki atvykę į <span className="text-blue-600 dark:text-blue-400">FreelanceQuest</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Žaidimizuota platforma, kurioje laisvai samdomi specialistai kyla lygiais, renka ženklelius ir randa klientus.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-5xl w-full text-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
            <Trophy className="w-8 h-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Tobulėk kaip specialistas
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Uždirbk XP, kelk savo lygį ir augink reputaciją atlikdamas projektus.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
            <TrendingUp className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <h3 className="text-xl font-semibold text-yellow-500 mb-2">
              Rink ženklelius
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Atskleisk savo pasiekimus ir nuoseklumą vizualiais apdovanojimais.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
            <Users className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-xl font-semibold text-emerald-500 mb-2">
              Rask klientus
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Būk susietas su tau tinkamais projektais pagal tavo įgūdžius ir stilių.
            </p>
          </div>
        </div>

        <div className="mt-20 max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Kodėl verta naudotis FreelanceQuest?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-md">
            FreelanceQuest motyvuoja, suteikia matomumą ir padeda tau išlikti konkurencingam. Nesvarbu, ar tik pradedi, ar jau esi patyręs – čia tavo kelionė bus apdovanota.
          </p>
        </div>
      </main>
    </div>
  );
}

