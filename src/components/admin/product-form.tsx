"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import type { Category, Occasion } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  slug: z.string().min(2, "Mínimo 2 caracteres"),
  tagline: z.string().optional(),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  basePrice: z.number().min(1000, "Mínimo $1.000"),
  categoryId: z.string().optional(),
  stock: z.number().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  images: z.array(z.object({ url: z.string().url("URL inválida") })),
  tags: z.string(),
  occasionIds: z.array(z.string()),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductWithOccasions {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  basePrice: number;
  categoryId: string | null;
  stock: number;
  active: boolean;
  featured: boolean;
  images: string[];
  tags: string[];
  occasions: { occasion: { id: string } }[];
}

interface Props {
  product?: ProductWithOccasions;
  categories: Category[];
  occasions: Occasion[];
}

export function ProductForm({ product, categories, occasions }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      tagline: product?.tagline ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 50000,
      categoryId: product?.categoryId ?? "",
      stock: product?.stock ?? 0,
      active: product?.active ?? true,
      featured: product?.featured ?? false,
      images: (product?.images ?? [""]).map((url) => ({ url })),
      tags: (product?.tags ?? []).join(", "),
      occasionIds: product?.occasions.map((o) => o.occasion.id) ?? [],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } =
    useFieldArray({ control, name: "images" });

  const watchedName = watch("name");

  function autoSlug() {
    const slug = watchedName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setValue("slug", slug);
  }

  const watchedOccasions = watch("occasionIds");

  function toggleOccasion(id: string) {
    const current = watchedOccasions ?? [];
    setValue(
      "occasionIds",
      current.includes(id) ? current.filter((o) => o !== id) : [...current, id]
    );
  }

  async function onSubmit(data: ProductFormData) {
    setSaving(true);
    try {
      const payload = {
        ...data,
        images: data.images.map((i) => i.url).filter(Boolean),
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        categoryId: data.categoryId || null,
      };

      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al guardar");

      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
      router.refresh();
    } catch {
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-forest">
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h1>
          <p className="text-sm font-sans text-forest/50 mt-1">
            {isEdit ? `ID: ${product!.id}` : "Completa todos los campos requeridos"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/productos")}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <section className="bg-white border border-forest/8 rounded-sm p-6 flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Información básica
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            {...register("name")}
            error={errors.name?.message}
            onBlur={autoSlug}
          />
          <Input
            label="Slug *"
            {...register("slug")}
            error={errors.slug?.message}
            hint="URL amigable — se genera automáticamente"
          />
        </div>
        <Input
          label="Tagline"
          {...register("tagline")}
          hint="Frase corta para mostrar bajo el nombre"
        />
        <Textarea
          label="Descripción *"
          rows={4}
          {...register("description")}
          error={errors.description?.message}
        />
      </section>

      {/* Pricing & inventory */}
      <section className="bg-white border border-forest/8 rounded-sm p-6 flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Precio e inventario
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Precio base (COP) *"
            type="number"
            {...register("basePrice", { valueAsNumber: true })}
            error={errors.basePrice?.message}
          />
          <Input
            label="Stock *"
            type="number"
            {...register("stock", { valueAsNumber: true })}
            error={errors.stock?.message}
          />
          <Select
            label="Categoría"
            {...register("categoryId")}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("active")}
              className="w-4 h-4 accent-forest"
            />
            <span className="text-sm font-sans text-forest">Producto activo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-4 h-4 accent-forest"
            />
            <span className="text-sm font-sans text-forest">Destacado en inicio</span>
          </label>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-forest/8 rounded-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
            Imágenes (URLs)
          </h2>
          <button
            type="button"
            onClick={() => appendImage({ url: "" })}
            className="text-xs font-sans text-forest/50 hover:text-forest transition-colors"
          >
            + Agregar
          </button>
        </div>
        {imageFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label={`Imagen ${i + 1}`}
                placeholder="https://..."
                {...register(`images.${i}.url`)}
                error={(errors.images?.[i] as { url?: { message?: string } } | undefined)?.url?.message}
              />
            </div>
            {imageFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="mb-1 text-xs text-burgundy hover:text-burgundy/70 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Tags & occasions */}
      <section className="bg-white border border-forest/8 rounded-sm p-6 flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-brand font-sans font-medium text-forest/40">
          Etiquetas y ocasiones
        </h2>
        <Input
          label="Etiquetas"
          {...register("tags")}
          hint="Separadas por coma: rosa, romantico, cumpleaños"
        />
        <div>
          <p className="text-[10px] uppercase tracking-brand font-sans font-medium text-forest/40 mb-2">
            Ocasiones
          </p>
          <div className="flex flex-wrap gap-2">
            {occasions.map((o) => {
              const selected = (watchedOccasions ?? []).includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleOccasion(o.id)}
                  className={`px-3 py-1.5 text-xs font-sans rounded-sm border transition-colors ${
                    selected
                      ? "bg-forest text-cream border-forest"
                      : "bg-white text-forest/50 border-forest/20 hover:border-forest/50"
                  }`}
                >
                  {o.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </form>
  );
}
