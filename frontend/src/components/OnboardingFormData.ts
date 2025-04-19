export type Role = "freelancer" | "client";

export interface FormData {
  first_name: string;
  last_name: string;
  role: Role | "";
  profile_picture: File | null;

  // freelancer
  bio?: string;
  skills?: string[];
  portfolio_links?: string[];

  // client
  is_business?: boolean;
  organization?: string;
  business_description?: string;
  website?: string;

  address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
}
