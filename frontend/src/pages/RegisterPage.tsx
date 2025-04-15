import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authApi";
import { Label, TextInput, Button, Card } from "flowbite-react";
import toast from "react-hot-toast";
import { HiMail } from "react-icons/hi";
import { HiLockClosed } from "react-icons/hi2";

type APIError = {
  response?: {
    data?: {
      email?: string[];
      password1?: string[];
      password2?: string[];
    };
  };
};


export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password1: "",
    password2: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password1?: string;
    password2?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!form.email.includes("@")) {
      newErrors.email = "Įveskite galiojantį el. pašto adresą";
    }
    if (form.password1.length < 8) {
      newErrors.password1 = "Slaptažodis turi būti bent 8 simbolių";
    }
    if (form.password1 !== form.password2) {
      newErrors.password2 = "Slaptažodžiai nesutampa";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      await register(form);
      toast.success("Užsiregistruota sėkmingai!");
      navigate("/login");
    } catch (err: unknown) {
      const apiErrors = (err as APIError).response?.data;
      setErrors({
        email: apiErrors?.email?.[0],
        password1: apiErrors?.password1?.[0],
        password2: apiErrors?.password2?.[0],
      });
      toast.error("Registracija nepavyko");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-md">
        <h2 className="text-2xl font-bold text-center dark:text-white">Registracija</h2>
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
            <Label htmlFor="password1">Slaptažodis</Label>
            <TextInput
              id="password1"
              name="password1"
              type="password"
              icon={HiLockClosed}
              required
              value={form.password1}
              onChange={handleChange}
              color={errors.password1 ? "failure" : undefined}
            />
            {errors.password1 && (
              <p className="text-sm text-red-600 mt-1">{errors.password1}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password2">Pakartokite slaptažodį</Label>
            <TextInput
              id="password2"
              name="password2"
              type="password"
              icon={HiLockClosed}
              required
              value={form.password2}
              onChange={handleChange}
              color={errors.password2 ? "failure" : undefined}
            />
            {errors.password2 && (
              <p className="text-sm text-red-600 mt-1">{errors.password2}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kraunama..." : "Registruotis"}
          </Button>

        </form>
      </Card>
    </div>
  );
}

