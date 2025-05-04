import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import api from "../services/axios";
import { FaFlask, FaLevelUpAlt, FaMedal, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Spinner, Button } from "flowbite-react";

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

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = currentUser?.username === username;
  const [badges, setBadges] = useState<Badge[]>([]);
  const [benefits, setBenefits] = useState<PlatformBenefit[]>([]);
  const [userBenefits, setUserBenefits] = useState<UserBenefit[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, badgeRes, benefitRes, userBenefitRes] = await Promise.all([
          api.get(`/user/profile/${username}/`),
          api.get(`/gamification/badges/`),
          api.get(`/gamification/platform-benefits/`),
          api.get(`/gamification/user-benefits/`),
        ]);
        setProfile(profileRes.data);
        setBadges(badgeRes.data);
        setBenefits(benefitRes.data);
        setUserBenefits(userBenefitRes.data);
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
          <Button color="blue" className="text-sm px-4 py-2 rounded-md">
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

      {badges.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Ženkleliai</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg text-center border shadow-sm transition-all duration-200 ${badge.unlocked
                  ? "bg-yellow-100 dark:bg-yellow-800 border-yellow-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-400 opacity-50"
                  }`}
              >
                <div className="text-4xl mb-2">{badge.icon || "🏆"}</div>
                <h3 className="text-sm font-bold">{badge.title}</h3>
                <p className="text-xs">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Platformos naudos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {benefits.map((benefit) => {
            const owned = ownedBenefitIds.has(benefit.id);
            return (
              <div
                key={benefit.id}
                className={`p-4 rounded-lg shadow flex flex-col justify-between h-full ${owned ? "bg-green-100 dark:bg-green-900" : "bg-white dark:bg-gray-800"
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
    </div>
  );
}
