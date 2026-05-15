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

const SANS  = "var(--font-manrope, sans-serif)";

const productSchema = z.object({
  name:        z.string().min(2, "Mínimo 2 caracteres"),
  slug:        z.string().min(2, "Mínimo 2 caracteres"),
  tagline:     z.string().optional(),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  basePrice:   z.number().min(1000, "Mínimo $1.000"),
  categoryId:  z.string().optional(),
  stock:       z.number().min(0),
  active:      z.boolean(),
  featured:    z.boolean(),
  images:      z.array(z.object({ url: z.string().url("URL inválida") })),
  tags:        z.string(),
  occasionIds: z.array(z.string()),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductWithOccasions {
  id: string; name: string; slug: string; tagline: string | null;
  description: string; basePrice: number; categoryId: string | null;
  stock: number; active: boolean; featured: boolean; images: string[];
  tags: string[]; occasions: { occasion: { id: string } }[];
}

interface Props { product?: ProductWithOccasions; categories: Category[]; occasions: Occasion[] }

/* Section wrapper */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB" }}>
        <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", fontFamily: SANS }}>
          {title}
        </p>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

export function ProductForm({ product, categories, occasions }: Props) {
  const router  = useRouter();
  const [saving, setSaving] = useState(false);
  const isEdit  = !!product;

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } =
    useForm<ProductFormData>({
      resolver: zodResolver(productSchema),
      defaultValues: {
        name:        product?.name ?? "",
        slug:        product?.slug ?? "",
        tagline:     product?.tagline ?? "",
        description: product?.description ?? "",
        basePrice:   product?.basePrice ?? 50000,
        categoryId:  product?.categoryId ?? "",
        stock:       product?.stock ?? 0,
        active:      product?.active ?? true,
        featured:    product?.featured ?? false,
        images:      (product?.images ?? [""]).map((url) => ({ url })),
        tags:        (product?.tags ?? []).join(", "),
        occasionIds: product?.occasions.map((o) => o.occasion.id) ?? [],
      },
    });

  const { fields: imageFields, append: appendImage, remove: removeImage } =
    useFieldArray({ control, name: "images" });

  const watchedName      = watch("name");
  const watchedOccasions = watch("occasionIds");

  function autoSlug() {
    const slug = watchedName.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    setValue("slug", slug);
  }

  function toggleOccasion(id: string) {
    const cur = watchedOccasions ?? [];
    setValue("occasionIds", cur.includes(id) ? cur.filter((o) => o !== id) : [...cur, id]);
  }

  async function onSubmit(data: ProductFormData) {
    setSaving(true);
    try {
      const payload = {
        ...data,
        images:     data.images.map((i) => i.url).filter(Boolean),
        tags:       data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        categoryId: data.categoryId || null,
      };
      const res = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error();
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, fontFamily: SANS }}>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: "#111827", letterSpacing: "0.04em", lineHeight: 1 }}>
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 5 }}>
            {isEdit ? `ID: ${product!.id}` : "Completa los campos requeridos *"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => router.push("/admin/productos")}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </div>

      {/* Basic info */}
      <Section title="Información básica">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre *" {...register("name")} error={errors.name?.message} onBlur={autoSlug} />
          <Input label="Slug *" {...register("slug")} error={errors.slug?.message} hint="Se genera automáticamente" />
        </div>
        <Input label="Tagline" {...register("tagline")} hint="Frase corta bajo el nombre" />
        <Textarea label="Descripción *" rows={4} {...register("description")} error={errors.description?.message} />
      </Section>

      {/* Pricing */}
      <Section title="Precio e inventario">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Precio base (COP) *" type="number" {...register("basePrice", { valueAsNumber: true })} error={errors.basePrice?.message} />
          <Input label="Stock *" type="number" {...register("stock", { valueAsNumber: true })} error={errors.stock?.message} />
          <Select label="Categoría" {...register("categoryId")}>
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="flex gap-6">
          {[
            { name: "active"   as const, label: "Producto activo"       },
            { name: "featured" as const, label: "Destacado en inicio"   },
          ].map((f) => (
            <label key={f.name} className="flex items-center gap-2 cursor-pointer" style={{ userSelect: "none" }}>
              <input
                type="checkbox"
                {...register(f.name)}
                style={{ width: 15, height: 15, accentColor: "#1F3A2E", cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "#374151" }}>{f.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Images */}
      <Section title="Imágenes (URLs)">
        <div className="flex flex-col gap-3">
          {imageFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label={i === 0 ? "Imagen principal" : `Imagen ${i + 1}`}
                  placeholder="https://images.unsplash.com/..."
                  {...register(`images.${i}.url`)}
                  error={(errors.images?.[i] as { url?: { message?: string } } | undefined)?.url?.message}
                />
              </div>
              {imageFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ padding: "0 10px", height: 36, fontSize: 13, color: "#EF4444", background: "none", border: "1px solid #FCA5A5", borderRadius: 4, cursor: "pointer", flexShrink: 0, marginBottom: 0 }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendImage({ url: "" })}
            style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: 12, color: "#1F3A2E", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 5, cursor: "pointer", fontFamily: SANS }}
          >
            + Agregar imagen
          </button>
        </div>
      </Section>

      {/* Tags & occasions */}
      <Section title="Etiquetas y ocasiones">
        <Input label="Etiquetas" {...register("tags")} hint="Separadas por coma: rosa, romantico, cumpleaños" />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 10 }}>
            Ocasiones
          </p>
          <div className="flex flex-wrap gap-2">
            {occasions.map((o) => {
              const sel = (watchedOccasions ?? []).includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => toggleOccasion(o.id)}
                  style={{
                    padding: "5px 13px", fontSize: 12, fontFamily: SANS, cursor: "pointer",
                    borderRadius: 5,
                    border: `1px solid ${sel ? "#1F3A2E" : "#E5E7EB"}`,
                    background: sel ? "#1F3A2E" : "#fff",
                    color:      sel ? "#fff" : "#374151",
                    fontWeight: sel ? 600 : 400,
                    transition: "all 0.12s",
                  }}
                >
                  {o.name}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Save button bottom */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
