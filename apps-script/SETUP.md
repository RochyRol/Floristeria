# Configurar la sincronización con Google Sheets

5 minutos. Sin Google Cloud, sin credenciales, sin npm install extra.

## 1. Crea la hoja de cálculo

1. Ve a [sheets.google.com](https://sheets.google.com) → **Hoja en blanco**.
2. Renómbrala a algo como **"Deco Imperio — Datos"**.

## 2. Pega el script

1. En la hoja, abre **Extensiones → Apps Script**.
2. Borra todo lo que aparezca por defecto en `Code.gs`.
3. Pega TODO el contenido de [`sheet-sync.gs`](./sheet-sync.gs).
4. Edita la línea:

   ```js
   const SHARED_SECRET = "CHANGE_ME_random_string_12345";
   ```

   Cámbialo por una cadena aleatoria. **Guarda esta cadena**, la vas a necesitar en el `.env`.

5. **Ctrl+S** (o ⌘+S) para guardar el script. Dale un nombre al proyecto si te pide.

## 3. Despliégalo como Web App

1. En el editor, haz clic en **Deploy → New deployment**.
2. En "Select type" (icono ⚙️), elige **Web app**.
3. Configura:
   - **Description**: "Sync from Next.js"
   - **Execute as**: *Me (tu cuenta)*
   - **Who has access**: *Anyone* ⚠️ (importante, el secret es la protección)
4. Haz clic en **Deploy**.
5. La primera vez te pedirá autorización: dale **Authorize access** → elige tu cuenta → **Advanced** → **Go to (your project name) (unsafe)** → **Allow**.
6. Te dará una URL parecida a:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec
   ```
   **Cópiala**.

## 4. Configura tu `.env`

En el `.env` del proyecto, llena estas dos líneas:

```env
GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/XXXXXXXXXXXXXXX/exec"
SHEETS_SYNC_SECRET="el_mismo_string_que_pusiste_en_SHARED_SECRET"
```

Reinicia el dev server (`npm run dev`).

## 5. Pruébalo

1. Entra al admin: `http://localhost:3000/admin` (con `admin@decoimperio.com / admin123`).
2. Verás un cuadro arriba que dice **"Google Sheets — Envía la base de datos completa…"** con un botón **Sincronizar Sheets**.
3. Haz clic. Debería salir un toast de éxito en pocos segundos.
4. Vuelve a tu hoja de Google → verás 11 pestañas creadas:
   - **Resumen** — KPIs principales
   - **Usuarios** — incluye contraseñas en plano para los del seed
   - **Productos** — todo el catálogo
   - **Categorías** — Rosas, Mixtos, Girasoles, etc.
   - **Ocasiones** — Amor, Cumpleaños, etc.
   - **Pedidos** — todos los pedidos con cliente, dirección, total
   - **PedidoItems** — líneas de cada pedido (qué producto, cuánto, dedicatoria)
   - **Historial** — cambios de estado de pedidos
   - **Direcciones** — direcciones guardadas por usuarios
   - **Cupones**
   - **Favoritos**

## 6. Sincronización automática de pedidos nuevos

Una vez configurado el `.env`, **cada vez que entre un pedido nuevo en el sitio**, se agrega solo a las pestañas `Pedidos` y `PedidoItems`. No tienes que hacer nada, es automático.

El botón "Sincronizar Sheets" en el admin sigue siendo útil para:
- La primera carga inicial
- Cuando agregues productos/usuarios/cupones en el admin
- Cuando cambies estados de pedidos (refresca el `Historial`)

## Si algo falla

| Problema | Solución |
|----------|----------|
| `Configura GOOGLE_SHEETS_WEBHOOK_URL...` | El `.env` no tiene los valores. Reinicia el dev server. |
| `HTTP 401: Invalid secret` | El `SHEETS_SYNC_SECRET` del `.env` no coincide con el `SHARED_SECRET` del script. |
| `HTTP 401` (no `Invalid secret`) | El web app no está como **Anyone**. Vuelve a Deploy → Manage deployments → ✏️ → "Who has access: Anyone". |
| El toast dice "Error de red" | El `GOOGLE_SHEETS_WEBHOOK_URL` está mal (debe terminar en `/exec`). |
| Cambias el script y no se actualiza | Tienes que crear **una nueva versión** del deployment: Deploy → Manage deployments → ✏️ → New version. |

## Reglas de seguridad

- El `SHEETS_SYNC_SECRET` es lo único que protege tu hoja. **No lo compartas**.
- La URL del webhook *no* es secreta por sí sola — sin el secret no funciona.
- Las contraseñas en plano solo se mandan para los 4 usuarios del seed (admin/vendedor/florista/cliente). Los usuarios reales registrados solo van con el hash bcrypt.
