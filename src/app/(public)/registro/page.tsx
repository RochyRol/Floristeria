import { Metadata } from "next";
import { RegisterClient } from "@/components/auth/register-client";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
