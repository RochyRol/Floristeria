import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});
const prisma = new PrismaClient({ adapter });

const occasions = [
  { slug: "amor", name: "Amor", description: "Para quien llena tus días de luz", sortOrder: 1, image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&q=80&fit=crop" },
  { slug: "cumpleanos", name: "Cumpleaños", description: "Celebra con flores y color", sortOrder: 2, image: "https://images.unsplash.com/photo-1558635924-b60e7f3b849c?w=800&q=80&fit=crop" },
  { slug: "aniversario", name: "Aniversario", description: "Años de historia que merecen flores", sortOrder: 3, image: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=80&fit=crop" },
  { slug: "condolencias", name: "Condolencias", description: "Acompañar con dignidad y respeto", sortOrder: 4, image: "https://images.unsplash.com/photo-1523698374983-5c9fe97c9b11?w=800&q=80&fit=crop" },
  { slug: "nacimiento", name: "Nacimiento", description: "Bienvenida al mundo más puro", sortOrder: 5, image: "https://images.unsplash.com/photo-1566479179817-7fa0cb3c1688?w=800&q=80&fit=crop" },
  { slug: "empresarial", name: "Empresarial", description: "Imagen y elegancia para tu empresa", sortOrder: 6, image: "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=800&q=80&fit=crop" },
  { slug: "graduacion", name: "Graduación", description: "El inicio de una nueva etapa", sortOrder: 7, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&fit=crop" },
];

const categories = [
  { slug: "rosas", name: "Rosas", description: "Bouquets y arreglos de rosas premium" },
  { slug: "mixtos", name: "Mixtos", description: "Combinaciones artesanales de flores" },
  { slug: "girasoles", name: "Girasoles", description: "Alegría y positivismo en cada tallo" },
  { slug: "silvestres", name: "Silvestres", description: "Arreglos boho con flores del campo" },
  { slug: "preservadas", name: "Preservadas", description: "Flores que duran para siempre" },
  { slug: "cajas", name: "Cajas & Box", description: "Presentaciones en caja premium" },
];

const defaultSizes = [
  { id: "sencillo", label: "Sencillo", price: 0.75, description: "Arreglo más compacto y delicado" },
  { id: "standard", label: "Estándar", price: 1, description: "Tamaño clásico y generoso" },
  { id: "premium", label: "Premium", price: 1.5, description: "Nuestro arreglo más espectacular" },
];

const products = [
  // AMOR
  {
    slug: "rojo-eterno",
    name: "Rojo Eterno",
    tagline: "12 rosas rojas premium en caja kraft",
    description: "Doce rosas rojas de alto corte seleccionadas una a una, presentadas en una elegante caja kraft con cinta de organza. El regalo clásico que nunca falla, elevado por nuestra curaduría artesanal.",
    basePrice: 180000,
    category: "rosas",
    occasions: ["amor", "aniversario"],
    images: [
      "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=800&q=85&fit=crop",
      "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "12 rosas rojas premium", "Empaque": "Caja kraft artesanal con cinta dorada", "Altura aprox.": "40 cm", "Duración": "5-7 días", "Cuidados": "Agua fresca cada 2 días, lejos del sol directo" },
    featured: true,
  },
  {
    slug: "pasion-de-medianoche",
    name: "Pasión de Medianoche",
    tagline: "24 rosas rojas en jarrón de cristal",
    description: "Veinticuatro rosas rojas de terciopelo en un elegante jarrón de cristal con agua y conservante floral. Para los momentos que merecen el doble de amor.",
    basePrice: 320000,
    category: "rosas",
    occasions: ["amor", "aniversario"],
    images: [
      "https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "24 rosas rojas premium", "Empaque": "Jarrón de cristal incluido", "Altura aprox.": "55 cm", "Duración": "6-8 días" },
    featured: true,
  },
  {
    slug: "susurro-de-petalos",
    name: "Susurro de Pétalos",
    tagline: "Bouquet mixto rosas y gypsophila",
    description: "Una combinación etérea de rosas rosadas y blancas con gypsophila (nube) y follaje verde fresco. Envuelto en papel coreano mate con lazo de rafia natural.",
    basePrice: 150000,
    category: "mixtos",
    occasions: ["amor", "cumpleanos", "aniversario"],
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "8 rosas mixtas, gypsophila y follaje", "Empaque": "Papel coreano y rafia natural", "Altura aprox.": "45 cm" },
    featured: false,
  },
  {
    slug: "amor-en-box",
    name: "Amor en Box",
    tagline: "Caja sorpresa con rosas preservadas",
    description: "Una lujosa caja circular de cartón negro con rosas preservadas de colores pastel, que duran hasta 2 años sin agua ni cuidados especiales. El regalo eterno.",
    basePrice: 280000,
    category: "preservadas",
    occasions: ["amor", "aniversario", "cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas preservadas 100% naturales", "Duración": "Hasta 2 años", "Empaque": "Caja circular premium" },
    featured: true,
  },
  {
    slug: "beso-frances",
    name: "Beso Francés",
    tagline: "Rosas blancas y rosadas en papel coreano",
    description: "La delicadeza francesa en un bouquet: rosas blancas garden y rosas rosadas pastel con eucalipto y asparagus. Envuelto en papel coreano texturado color blanco hueso.",
    basePrice: 195000,
    category: "rosas",
    occasions: ["amor", "cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas blancas garden, rosas rosadas, eucalipto", "Empaque": "Papel coreano texturado" },
    featured: false,
  },
  {
    slug: "romance-boho",
    name: "Romance Boho",
    tagline: "Arreglo silvestre con eucalipto",
    description: "Para las almas libres: un arreglo de estilo boho con flores silvestres de temporada, eucalipto perfumado, pampas grass y limonium. Atado con cordón de cáñamo.",
    basePrice: 165000,
    category: "silvestres",
    occasions: ["amor", "cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Silvestres de temporada, eucalipto, pampas", "Empaque": "Kraft y cordón de cáñamo" },
    featured: false,
  },

  // CUMPLEAÑOS
  {
    slug: "sol-del-mediodia",
    name: "Sol del Mediodía",
    tagline: "Bouquet de girasoles frescos del campo",
    description: "Girasoles grandes y frescos que iluminan cualquier espacio. Acompañados de follaje verde exuberante y envueltos en papel kraft marrón con lazo amarillo.",
    basePrice: 140000,
    category: "girasoles",
    occasions: ["cumpleanos", "amor"],
    images: [
      "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "6-8 girasoles frescos, follaje verde", "Empaque": "Papel kraft natural" },
    featured: false,
  },
  {
    slug: "fiesta-tropical",
    name: "Fiesta Tropical",
    tagline: "Arreglo colorido con flores tropicales",
    description: "Una celebración de colores vivos: heliconias, anturios y gerberas en una paleta tropical que invita a festejar. Presentado en jarrón de terracota.",
    basePrice: 210000,
    category: "mixtos",
    occasions: ["cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1523694576729-dc99e9c0f9b4?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Heliconias, anturios, gerberas", "Empaque": "Jarrón de terracota incluido" },
    featured: false,
  },
  {
    slug: "primavera-feliz",
    name: "Primavera Feliz",
    tagline: "Mix de flores de temporada en colores pastel",
    description: "La primavera en tus manos: un bouquet alegre de flores de temporada en tonos pastel rosado, lila y blanco. Perfecto para alguien que ama los colores suaves.",
    basePrice: 130000,
    category: "mixtos",
    occasions: ["cumpleanos", "nacimiento"],
    images: [
      "https://images.unsplash.com/photo-1490750967868-88df5691cc08?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Mix de temporada, pastel", "Empaque": "Papel translúcido con cinta rosa" },
    featured: false,
  },
  {
    slug: "jardin-secreto",
    name: "Jardín Secreto",
    tagline: "Mix de peonías y flores silvestres",
    description: "Un arreglo que evoca un jardín inglés: peonías cuando están en temporada (o rosas garden como alternativa), lavanda, anemones y flores silvestres de campo.",
    basePrice: 230000,
    category: "silvestres",
    occasions: ["cumpleanos", "amor"],
    images: [
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Peonías/garden roses, lavanda, anemones", "Empaque": "Papel de seda texturado" },
    featured: false,
  },

  // ANIVERSARIO
  {
    slug: "eternamente-tuya",
    name: "Eternamente Tuya",
    tagline: "50 rosas rojas en caja premium",
    description: "El gesto definitivo: cincuenta rosas rojas de alto corte cuidadosamente dispuestas en nuestra caja negra premium. Para cuando las palabras no son suficientes.",
    basePrice: 750000,
    category: "rosas",
    occasions: ["aniversario", "amor"],
    images: [
      "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "50 rosas rojas premium", "Empaque": "Caja negra premium con tapa" },
    featured: true,
  },
  {
    slug: "luna-de-miel",
    name: "Luna de Miel",
    tagline: "Bouquet romántico blanco y champagne",
    description: "La pureza del amor duradero en blanco y champagne: rosas blancas, spray y lirios blancos con detalles dorados. El bouquet del aniversario más elegante.",
    basePrice: 250000,
    category: "rosas",
    occasions: ["aniversario"],
    images: [
      "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas blancas, spray, lirios blancos", "Empaque": "Caja blanca con cinta dorada" },
    featured: false,
  },

  // CONDOLENCIAS
  {
    slug: "serenidad-blanca",
    name: "Serenidad Blanca",
    tagline: "Arreglo fúnebre en tonos blancos",
    description: "Un arreglo de paz y serenidad en tonos blancos y verdes: liliums blancos, crisantemos y follaje exuberante. Diseñado para acompañar con dignidad en los momentos difíciles.",
    basePrice: 180000,
    category: "mixtos",
    occasions: ["condolencias"],
    images: [
      "https://images.unsplash.com/photo-1523698374983-5c9fe97c9b11?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Liliums blancos, crisantemos, follaje", "Formato": "Arreglo en base floral" },
    featured: false,
  },
  {
    slug: "corona-imperial",
    name: "Corona Imperial",
    tagline: "Corona fúnebre para velatorio",
    description: "Corona de flores naturales blancas y verdes para velatorio y capilla. Entregamos directamente en el lugar indicado con discreción y respeto.",
    basePrice: 350000,
    category: "mixtos",
    occasions: ["condolencias"],
    images: [
      "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Crisantemos blancos, liliums, follaje", "Formato": "Corona 80cm diámetro" },
    featured: false,
  },
  {
    slug: "paz-y-memoria",
    name: "Paz y Memoria",
    tagline: "Bouquet de condolencias",
    description: "Un bouquet sereno de liliums blancos, gladiolos y follaje verde para enviar con todo el afecto en momentos de pérdida.",
    basePrice: 140000,
    category: "mixtos",
    occasions: ["condolencias"],
    images: [
      "https://images.unsplash.com/photo-1523698374983-5c9fe97c9b11?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Liliums, gladiolos, follaje" },
    featured: false,
  },

  // NACIMIENTO
  {
    slug: "bienvenido-al-mundo",
    name: "Bienvenido al Mundo",
    tagline: "Bouquet rosado para bebé niña",
    description: "La bienvenida más dulce en tonos rosados: rosas spray rosadas, gerberas mini y gypsophila, perfectas para celebrar la llegada de una niña.",
    basePrice: 120000,
    category: "mixtos",
    occasions: ["nacimiento", "cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1566479179817-7fa0cb3c1688?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas spray rosadas, gerberas, gypsophila", "Empaque": "Papel coreano con cinta celeste/rosa" },
    featured: false,
  },
  {
    slug: "luna-azul",
    name: "Luna Azul",
    tagline: "Arreglo celeste para bebé niño",
    description: "Para dar la bienvenida al nuevo hombre de la casa: rosas azules (teñidas naturalmente), hortensia blanca y follaje en tonos celestes.",
    basePrice: 130000,
    category: "mixtos",
    occasions: ["nacimiento"],
    images: [
      "https://images.unsplash.com/photo-1596547608027-8bf2b955d62b?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas azules, hortensia blanca, follaje" },
    featured: false,
  },

  // EMPRESARIAL
  {
    slug: "imperio-corporativo",
    name: "Imperio Corporativo",
    tagline: "Arreglo de oficina en base de madera",
    description: "Elegancia corporativa: arreglo en tonos tierra y blancos en base de madera natural para recepción u oficina. Perfecto para inauguraciones o reconocimientos empresariales.",
    basePrice: 380000,
    category: "mixtos",
    occasions: ["empresarial"],
    images: [
      "https://images.unsplash.com/photo-1548199569-3e1c6aa8f469?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Orquídeas, anturios, hojas tropicales", "Base": "Madera natural incluida", "Altura": "70 cm" },
    featured: true,
  },
  {
    slug: "bienvenida-vip",
    name: "Bienvenida VIP",
    tagline: "Centrotable floral para sala de juntas",
    description: "Un centrotable de alto impacto para reuniones y recepciones: flores de temporada en paleta neutra sobre base de piedra volcánica.",
    basePrice: 280000,
    category: "mixtos",
    occasions: ["empresarial"],
    images: [
      "https://images.unsplash.com/photo-1455582916367-25f75bfc6710?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Flores de temporada, paleta neutra", "Base": "Piedra volcánica" },
    featured: false,
  },

  // GRADUACIÓN
  {
    slug: "nueva-etapa",
    name: "Nueva Etapa",
    tagline: "Bouquet festivo para graduación",
    description: "El bouquet perfecto para ese gran logro: rosas en el color favorito del graduado, girasoles de la alegría y follaje festivo. ¡A celebrar lo logrado!",
    basePrice: 160000,
    category: "mixtos",
    occasions: ["graduacion", "cumpleanos"],
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas a elección, girasoles, follaje festivo" },
    featured: false,
  },
  {
    slug: "diploma-floral",
    name: "Diploma Floral",
    tagline: "Arreglo en caja dorada de graduación",
    description: "Celebra el título con estilo: rosas premium en caja dorada con detalles de toques metálicos. El regalo perfecto para quienes se merecen lo mejor.",
    basePrice: 240000,
    category: "cajas",
    occasions: ["graduacion"],
    images: [
      "https://images.unsplash.com/photo-1496661415325-ef852f9e8e7c?w=800&q=85&fit=crop",
    ],
    specifications: { "Flores": "Rosas premium", "Empaque": "Caja dorada con lazo dorado" },
    featured: false,
  },
];

async function main() {
  console.log("🌱 Iniciando seed de Floristería Deco Imperio...\n");

  // Categories
  console.log("📂 Creando categorías...");
  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
    console.log(`  ✓ ${cat.name}`);
  }

  // Occasions
  console.log("\n🎉 Creando ocasiones...");
  const occasionMap: Record<string, string> = {};
  for (const occ of occasions) {
    const created = await prisma.occasion.upsert({
      where: { slug: occ.slug },
      update: occ,
      create: occ,
    });
    occasionMap[occ.slug] = created.id;
    console.log(`  ✓ ${occ.name}`);
  }

  // Products
  console.log("\n🌹 Creando productos...");
  for (const product of products) {
    const { occasions: productOccasions, category: categorySlug, ...productData } = product;

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...productData,
        categoryId: categoryMap[categorySlug] || null,
        sizes: defaultSizes,
        tags: productOccasions,
      },
      create: {
        ...productData,
        categoryId: categoryMap[categorySlug] || null,
        sizes: defaultSizes,
        tags: productOccasions,
      },
    });

    // Link occasions
    await prisma.productOccasion.deleteMany({ where: { productId: created.id } });
    for (const occasionSlug of productOccasions) {
      if (occasionMap[occasionSlug]) {
        await prisma.productOccasion.create({
          data: { productId: created.id, occasionId: occasionMap[occasionSlug] },
        }).catch(() => null);
      }
    }

    console.log(`  ✓ ${product.name} — ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(product.basePrice)}`);
  }

  // Users
  console.log("\n👤 Creando usuarios demo...");
  const adminPass = await bcrypt.hash("admin123", 12);
  const sellerPass = await bcrypt.hash("vendedor123", 12);
  const clientPass = await bcrypt.hash("cliente123", 12);

  await prisma.user.upsert({
    where: { email: "admin@decoimperio.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@decoimperio.com",
      password: adminPass,
      role: "ADMIN",
      phone: "3215039845",
    },
  });
  console.log("  ✓ admin@decoimperio.com / admin123 (ADMIN)");

  await prisma.user.upsert({
    where: { email: "vendedor@decoimperio.com" },
    update: {},
    create: {
      name: "Carlos Vendedor",
      email: "vendedor@decoimperio.com",
      password: sellerPass,
      role: "SELLER",
      phone: "3001234567",
    },
  });
  console.log("  ✓ vendedor@decoimperio.com / vendedor123 (SELLER)");

  await prisma.user.upsert({
    where: { email: "florista@decoimperio.com" },
    update: {},
    create: {
      name: "María Florista",
      email: "florista@decoimperio.com",
      password: await bcrypt.hash("florista123", 12),
      role: "FLORIST",
    },
  });
  console.log("  ✓ florista@decoimperio.com / florista123 (FLORIST)");

  await prisma.user.upsert({
    where: { email: "cliente@test.com" },
    update: {},
    create: {
      name: "Valentina Rueda",
      email: "cliente@test.com",
      password: clientPass,
      role: "CLIENT",
      phone: "3109876543",
    },
  });
  console.log("  ✓ cliente@test.com / cliente123 (CLIENT)");

  console.log("\n✅ Seed completado exitosamente!");
  console.log(`   ${products.length} productos | ${occasions.length} ocasiones | ${categories.length} categorías | 4 usuarios\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
