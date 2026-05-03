"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al crear la cuenta");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      toast.success("¡Cuenta creada! Bienvenida a Deco Imperio 🌸");
      router.push("/mi-cuenta");
    } catch {
      toast.error("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <p className="font-serif text-2xl text-forest">Deco Imperio</p>
            <p className="text-[10px] uppercase tracking-widest font-sans text-gold mt-0.5">
              Floristería
            </p>
          </Link>
        </div>

        <div className="bg-cream-dark border border-forest/8 rounded-sm p-8">
          <h1 className="font-serif text-xl text-forest mb-1">Crear cuenta</h1>
          <p className="text-sm font-sans text-forest/50 mb-6">
            Únete para gestionar tus pedidos fácilmente.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              variant="box"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              variant="box"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Teléfono (opcional)"
              type="tel"
              placeholder="3XX XXX XXXX"
              variant="box"
              {...register("phone")}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              variant="box"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              variant="box"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Crear cuenta
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-forest/8 text-center">
            <p className="text-sm font-sans text-forest/50">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-terracotta hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
