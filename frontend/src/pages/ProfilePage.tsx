import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/axios";
import {
  FaFlask,
  FaClock,
  FaLevelUpAlt,
  FaMedal,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { Spinner, Button } from "flowbite-react";
import EditProfileModal from "../components/EditProfileModal";
import { updateUserProfile } from "../services/authApi";

interface GamificationProfile {
  xp: number;
  level: number;
  points: number;
}

interface Badge {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface PlatformBenefit {
  id: number;
  name: string;
  description: string;
  cost: number;
  effect_code: string;
}

interface UserBenefit {
  benefit: PlatformBenefit;
}

interface ProfileData {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  gamification_profile: GamificationProfile;
  freelancer_profile?: {
    bio: string;
    skills: { id: number; name: string }[];
    portfolio_links: string[];
  };
  client_profile?: {
    organization: string;
    business_description: string;
    website: string;
  };
  role: "freelancer" | "client";
}

interface Mission {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  point_reward: number;
  goal_count: number;
  type: "daily" | "weekly" | "monthly" | "yearly" | "once";
}

interface MissionProgress {
  mission: Mission;
  completed: boolean;
  seen: boolean;
  current_count: number;
  completed_at?: string;
  goal_count: number;
}

interface Review {
  id: number;
  rating: number;
  feedback: string;
  gig_title: string;
  created_at: string;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = currentUser?.username === username;
  const [badges, setBadges] = useState<Badge[]>([]);
  const [benefits, setBenefits] = useState<PlatformBenefit[]>([]);
  const [userBenefits, setUserBenefits] = useState<UserBenefit[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"badges" | "missions">("badges");
  const [badgeSubTab, setBadgeSubTab] = useState<"all" | "unlocked">("unlocked");
  const [missionType, setMissionType] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "once"
  >("daily");
  const [allMissions, setAllMissions] = useState<Mission[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, MissionProgress>>({});
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          profileRes,
          badgeRes,
          benefitRes,
          userBenefitRes,
          allMissionRes,
          progressRes,
          reviewsRes,
        ] = await Promise.all([
          api.get(`/user/profile/${username}/`),
          api.get(`/gamification/badges/?username=${username}`),
          api.get(`/gamification/platform-benefits/`),
          api.get(`/gamification/user-benefits/`),
          api.get(`/gamification/missions/`),
          api.get(`/gamification/progress/?username=${username}`),
          api.get(`/reviews/?gig__freelancer__username=${username}`),
        ]);

        setProfile(profileRes.data);
        setBadges(badgeRes.data);
        setBenefits(benefitRes.data);
        setUserBenefits(userBenefitRes.data);
        setAllMissions(allMissionRes.data);

        const progress: MissionProgress[] = progressRes.data;
        const map: Record<number, MissionProgress> = {};
        for (const p of progress) {
          map[p.mission.id] = {
            ...p,
            mission: p.mission,
            current_count: p.current_count,
            goal_count:
              typeof p.goal_count === "number"
                ? p.goal_count
                : typeof p.mission.goal_count === "number"
                  ? p.mission.goal_count
                  : 1,
          };
        }
        setProgressMap(map);

        setReviews(
          reviewsRes.data.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );

      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [username]);


  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  const ownedBenefitIds = new Set(userBenefits.map((ub) => ub.benefit.id));

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
      <div className="flex items-center justify-between gap-6 border-b pb-6">
        <div className="flex items-center gap-6">
          <img
            src={profile.profile_picture}
            alt={profile.first_name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
          <div>
            <h1 className="text-3xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-gray-500">@{profile.username}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <FaFlask className="text-blue-500" /> {profile.gamification_profile.xp} XP
              </span>
              <span className="flex items-center gap-1">
                <FaLevelUpAlt className="text-green-500" /> {profile.gamification_profile.level} lygis
              </span>
              <span className="flex items-center gap-1">
                <FaMedal className="text-yellow-500" /> {profile.gamification_profile.points}{" "}
                {profile.gamification_profile.points < 10 ? "taškai" : "taškų"}
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <Button color="blue" className="text-sm px-4 py-2 rounded-md" onClick={() => setEditOpen(true)}>
            Redaguoti profilį
          </Button>
        )}
      </div>

      {profile.role === "freelancer" && profile.freelancer_profile && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Apie mane</h2>
          <p className="text-gray-700 dark:text-gray-200">{profile.freelancer_profile.bio}</p>

          <div>
            <h3 className="font-semibold">Įgūdžiai:</h3>
            <ul className="flex flex-wrap gap-2 text-sm mt-2">
              {profile.freelancer_profile.skills.map((skill) => (
                <li key={skill.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs dark:bg-blue-900 dark:text-blue-200">
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>

          {profile.freelancer_profile.portfolio_links.length > 0 && (
            <div>
              <h3 className="font-semibold mt-4">Portfolio:</h3>
              <ul className="list-disc pl-5 mt-1">
                {profile.freelancer_profile.portfolio_links.map((link, i) => (
                  <li key={i}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {profile.role === "client" && profile.client_profile && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-2">
          <h2 className="text-xl font-semibold mb-2">Apie organizaciją</h2>
          <p><strong>Organizacija:</strong> {profile.client_profile.organization}</p>
          <p><strong>Aprašymas:</strong> {profile.client_profile.business_description}</p>
          {profile.client_profile.website && (
            <p>
              <strong>Svetainė:</strong>{" "}
              <a href={profile.client_profile.website} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">
                {profile.client_profile.website}
              </a>
            </p>
          )}
        </div>
      )}

      {profile.role === "freelancer" && reviews.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Atsiliepimai</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-lg border dark:border-gray-700 shadow">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  <strong>{review.gig_title}</strong> – {review.feedback}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  Įvertinimas:
                  {[...Array(5)].map((_, i) =>
                    i < review.rating ? (
                      <FaStar key={i} className="text-yellow-400" />
                    ) : (
                      <FaRegStar key={i} className="text-gray-300" />
                    )
                  )}
                  – {new Date(review.created_at).toLocaleDateString("lt-LT")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pasiekimai</h2>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex gap-4 text-sm font-medium">
            <li>
              <button
                className={`pb-2 transition border-b-2 ${activeTab === "badges" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-blue-300"}`}
                onClick={() => setActiveTab("badges")}
              >
                Ženkleliai
              </button>
            </li>
            <li>
              <button
                className={`pb-2 transition border-b-2 ${activeTab === "missions" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-blue-300"}`}
                onClick={() => setActiveTab("missions")}
              >
                Misijos
              </button>
            </li>
          </ul>
        </div>

        {activeTab === "badges" && (
          <>
            <div className="flex gap-4 text-sm font-medium mb-4">
              <button
                className={`pb-1 border-b-2 transition ${badgeSubTab === "unlocked"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-blue-300"
                  }`}
                onClick={() => setBadgeSubTab("unlocked")}
              >
                Gauti
              </button>
              <button
                className={`pb-1 border-b-2 transition ${badgeSubTab === "all"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-blue-300"
                  }`}
                onClick={() => setBadgeSubTab("all")}
              >
                Visi
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {badges
                .filter((b) => badgeSubTab === "all" || b.unlocked)
                .map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-xl border p-4 text-center shadow-sm transition transform hover:-translate-y-1 ${badge.unlocked
                      ? "bg-yellow-100 dark:bg-yellow-800 border-yellow-300 dark:border-yellow-600"
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60"
                      }`}
                  >
                    <div className="text-5xl mb-2">{badge.icon || "🏆"}</div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {badge.description}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}


        {activeTab === "missions" && (
          <>
            <div className="flex flex-wrap gap-4 text-sm font-medium mb-4">
              {["daily", "weekly", "monthly", "yearly", "once"].map((type) => (
                <button
                  key={type}
                  className={`pb-1 border-b-2 transition capitalize ${missionType === type ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:text-blue-300"}`}
                  onClick={() => setMissionType(type as any)}
                >
                  {{
                    daily: "Dieninės",
                    weekly: "Savaitinės",
                    monthly: "Mėnesinės",
                    yearly: "Metinės",
                    once: "Vienkartinės",
                  }[type]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {allMissions
                .filter((m) => m.type === missionType)
                .map((mission) => {
                  const progress = progressMap[mission.id] ?? {
                    current_count: 0,
                    goal_count: mission.goal_count ?? 1,
                    completed: false,
                  };
                  const completed = progress.completed;

                  return (
                    <div
                      key={mission.id}
                      className={`rounded-xl border p-4 shadow-sm transition transform hover:-translate-y-1 ${completed
                        ? "bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-600"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                        }`}
                    >
                      <h3 className="font-semibold text-gray-800 dark:text-white">{mission.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{mission.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          {completed ? (
                            <>
                              <FaCheckCircle className="text-green-500" />
                              Įvykdyta
                            </>
                          ) : (
                            <>
                              <FaClock className="text-yellow-500" />
                              Neįvykdyta
                            </>
                          )}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-medium text-blue-500">
                        +{mission.xp_reward} XP / +{mission.point_reward} taškų
                      </div>

                      <div className="mt-4">
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded">
                          <div
                            className="h-full bg-blue-500 rounded transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((progress.current_count / progress.goal_count) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 text-center">
                          {progress.current_count} / {progress.goal_count}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

          </>
        )}
        {isOwnProfile ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sistemos naudos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit) => {
                const owned = ownedBenefitIds.has(benefit.id);
                return (
                  <div
                    key={benefit.id}
                    className={`p-4 rounded-lg shadow flex flex-col justify-between h-full ${owned
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-white dark:bg-gray-800"
                      }`}
                  >
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {benefit.name}
                        {owned ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-red-400" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {benefit.description}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm">
                        <strong>Kaina:</strong> {benefit.cost}{" "}
                        {benefit.cost < 10 ? "taškai" : "taškų"}
                      </p>
                      {!owned && (
                        <Button
                          color="blue"
                          className="w-full sm:w-auto min-w-[100px] text-sm font-medium px-5 py-2 rounded-md"
                        >
                          Pirkti
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          onSave={async (formData) => {
            try {
              await updateUserProfile(formData);
              await refreshUser();
              const updated = await api.get(`/user/profile/${username}/`);
              setProfile(updated.data);
            } catch (err) {
              console.error("Failed to update profile", err);
            }
          }}
        />
      )}
    </div>
  );
}

