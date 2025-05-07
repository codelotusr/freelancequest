export interface Skill {
  id: number;
  name: string;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  points: number;
}

export interface ProfileData {
  pk: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  gamification_profile: GamificationProfile;
  role: "freelancer" | "client";
  freelancer_profile?: {
    bio: string;
    skills: Skill[];
    portfolio_links: string[];
  };
  client_profile?: {
    organization: string;
    business_description: string;
    website: string;
  };
}
