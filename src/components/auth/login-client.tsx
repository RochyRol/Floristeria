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

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email o contraseña incorrectos");
      } else {
        toast.success("¡Bienvenida de vuelta!");
        router.push("/mi-cuenta");
        router.refresh();
      }
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <p className="font-serif text-2xl text-forest">Deco Imperio</p>
            <p className="text-[10px] uppercase tracking-widest font-sans text-gold mt-0.5">
              Floristería
            </p>
          </Link>
        </div>

        <div className="bg-cream-dark border border-forest/8 rounded-sm p-8">
          <h1 className="font-serif text-xl text-forest mb-1">Iniciar sesión</h1>
          <p className="text-sm font-sans text-forest/50 mb-6">
            Accede a tu cuenta para ver tus pedidos.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              variant="box"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              variant="box"
              {...register("password")}
              error={errors.password?.message}
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Ingresar
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-forest/8 text-center">
            <p className="text-sm font-sans text-forest/50">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-terracotta hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
