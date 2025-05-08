import { useEffect, useState } from "react";
import { Spinner, Avatar } from "flowbite-react";
import { HiUserGroup, HiBriefcase } from "react-icons/hi2";
import { Link } from "react-router-dom";
import api from "../services/axios";

interface LeaderboardEntry {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  level: number;
  xp: number;
  points: number;
}

export default function LeaderboardPage() {
  const [freelancers, setFreelancers] = useState<LeaderboardEntry[]>([]);
  const [clients, setClients] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"freelancers" | "clients">("freelancers");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const [freelancersRes, clientsRes] = await Promise.all([
          api.get("/gamification/leaderboard/freelancers/"),
          api.get("/gamification/leaderboard/clients/"),
        ]);

        setFreelancers(Array.isArray(freelancersRes.data) ? freelancersRes.data : []);
        setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
      } catch (error) {
        console.error("Klaida įkeliant duomenis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-500 font-bold";
    if (index === 1) return "text-gray-400 font-semibold";
    if (index === 2) return "text-yellow-800 font-medium";
    return "";
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="overflow-x-auto mt-4 rounded-xl shadow ring-1 ring-gray-200 dark:ring-gray-700">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-300">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">#</th>
            <th className="px-6 py-3">Naudotojas</th>
            <th className="px-6 py-3">Lygis</th>
            <th className="px-6 py-3">XP</th>
            <th className="px-6 py-3">Taškai</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className={`px-6 py-4 ${getRankColor(index)}`}>{index + 1}</td>
              <td className="px-6 py-4 flex items-center gap-3">
                <Link
                  to={`/profile/${entry.username}`}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition"
                >
                  <Avatar
                    img={entry.profile_picture ? `http://localhost:8000${entry.profile_picture}` : undefined}
                    alt={`${entry.first_name} ${entry.last_name}`}
                    rounded
                    size="sm"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {entry.first_name} {entry.last_name}
                    </div>
                    <div className="text-xs text-gray-500">@{entry.username}</div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4">{entry.level}</td>
              <td className="px-6 py-4">{entry.xp}</td>
              <td className="px-6 py-4">{entry.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Lyderių lentelė
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab("freelancers")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "freelancers"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
            >
              <HiUserGroup className="inline mr-2" />
              Darbuotojai
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "clients"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                }`}
            >
              <HiBriefcase className="inline mr-2" />
              Klientai
            </button>
          </div>

          {activeTab === "freelancers"
            ? renderLeaderboard(freelancers)
            : renderLeaderboard(clients)}
        </>
      )}
    </div>
  );
}

