import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label, TextInput, Button, Card } from "flowbite-react";
import toast from "react-hot-toast";
import { HiMail } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";
import { useAuth } from "../context/useAuth";

type APIError = {
  response?: {
    data?: {
      email?: string[];
      password?: string[];
      non_field_errors?: string[];
    };
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      setErrors({ email: "Įveskite galiojantį el. pašto adresą" });
      return;
    }

    try {
      setIsLoading(true);
      await loginUser(form.email, form.password);
      toast.success("Prisijungta sėkmingai!");
    } catch (err: unknown) {
      const apiErrors = (err as APIError).response?.data;
      let generalError = apiErrors?.non_field_errors?.[0];
      if (generalError === "Unable to log in with provided credentials.") {
        generalError = "Neteisingas el. paštas arba slaptažodis";
      }
      setErrors({
        email: apiErrors?.email?.[0],
        password: apiErrors?.password?.[0],
        general: generalError || "Neteisingi prisijungimo duomenys",
      });
      toast.error("Prisijungimas nepavyko");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/temp");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-md">
        <h2 className="text-2xl font-bold text-center dark:text-white">Prisijungimas</h2>

        {errors.general && (
          <p className="text-sm text-red-600 mb-2 text-center">{errors.general}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">El. paštas</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              icon={HiMail}
              required
              value={form.email}
              onChange={handleChange}
              color={errors.email ? "failure" : undefined}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Slaptažodis</Label>
            <TextInput
              id="password"
              name="password"
              type="password"
              icon={HiLockClosed}
              required
              value={form.password}
              onChange={handleChange}
              color={errors.password ? "failure" : undefined}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kraunama..." : "Prisijungti"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

