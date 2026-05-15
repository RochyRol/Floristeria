# Diseño: Reportes descargables y pedidos personalizados en el local

**Fecha:** 2026-05-15  
**Estado:** Aprobado

---

## Resumen

Dos mejoras al panel administrativo:

1. **Reportes descargables** — botones de descarga Excel y PDF para reportes de ventas y clientes, integrados en la página `/admin/reportes` existente.
2. **Pedidos personalizados en el POS** — nueva pestaña "Personalizado" en el POS que permite registrar un pedido de local sin seleccionar un producto del catálogo.

---

## 1. Reportes descargables

### Qué se construye

Una nueva sección "Descargar reportes" que se inserta al inicio de la página `reports-client.tsx` existente, antes de las KPI cards. El resto de la página no cambia.

La sección contiene dos filas:
- **Reporte de Ventas** — ingresos, pedidos, ticket promedio, productos más vendidos, desglose por método de pago
- **Reporte de Clientes** — clientes activos en el período, nuevos vs recurrentes, ranking de mejores clientes por monto gastado

Cada fila tiene dos botones: **Excel** y **PDF**.

### Período

Los reportes usan tres botones de período fijo: **Esta semana**, **Este mes**, **Este año**. El período seleccionado se pasa como query param a la API de descarga (`?period=week|month|year`). Por defecto: este mes.

### Generación de archivos

**Excel:** librería `exceljs` en una ruta API server-side. Genera un `.xlsx` con múltiples hojas (Resumen, Detalle de ventas, Productos, etc.).

**PDF:** librería `@react-pdf/renderer` en la misma ruta. Genera un PDF con resumen ejecutivo: KPIs, tabla de productos más vendidos, ranking de clientes. Orientado a imprimir o compartir.

### Rutas API nuevas

- `GET /api/admin/reports/ventas?period=week|month|year&format=xlsx|pdf`
- `GET /api/admin/reports/clientes?period=week|month|year&format=xlsx|pdf`

Ambas protegidas por rol ADMIN o SELLER. Retornan el archivo como stream con los headers `Content-Disposition` correctos para forzar descarga.

### Contenido del reporte de ventas (Excel)

| Hoja | Contenido |
|------|-----------|
| Resumen | Total ingresos, número de pedidos, ticket promedio, comparación vs período anterior |
| Detalle ventas | Una fila por pedido: número, fecha, cliente, método de pago, total, estado |
| Productos | Nombre, unidades vendidas, ingresos generados |
| Métodos de pago | Desglose de ventas por método |

### Contenido del reporte de clientes (Excel)

| Hoja | Contenido |
|------|-----------|
| Resumen | Total clientes activos, nuevos, recurrentes |
| Ranking | Cliente, número de pedidos, total gastado, último pedido |
| Detalle | Una fila por cliente con su historial resumido |

### Contenido del PDF (ambos reportes)

Una página de resumen ejecutivo: logo/nombre del negocio, período, KPIs destacados, tabla top 5 (productos o clientes), pie de página con fecha de generación. Sin detalle granular — el detalle va en el Excel.

### Componente cliente

Nuevo componente `DownloadReportsSection` dentro de `reports-client.tsx`. Estado local: período seleccionado y loading por botón. Al hacer clic en un botón, hace `fetch` a la ruta correspondiente y usa `URL.createObjectURL` para desencadenar la descarga en el browser sin navegar fuera.

---

## 2. Pedidos personalizados en el POS

### Qué se construye

Una segunda pestaña **"Personalizado"** en el componente `pos-client.tsx`. El modo "Catálogo" (actual) no cambia en absoluto.

### Campos del formulario personalizado

| Campo | Tipo | Requerido |
|-------|------|-----------|
| Descripción del arreglo | Textarea | Sí |
| Precio | Number | Sí |
| Fecha de entrega | Date | No (por defecto: hoy) |
| Nombre del cliente | Text | No |
| Teléfono del cliente | Tel | No |
| Método de pago | Selector (mismo que catálogo) | Sí |

### Cambio al schema de base de datos

`OrderItem` tiene `productId` actualmente requerido. Se hace opcional (`productId String?`) y se agrega un campo `customDescription String?`. Una de las dos siempre debe estar presente (validado en la API).

### Flujo de creación

Al hacer clic en "Registrar pedido", el modo personalizado envía a `POST /api/orders` con:

```json
{
  "items": [{
    "customDescription": "Ramo de rosas rojas con girasoles...",
    "quantity": 1,
    "price": 85000
  }],
  "recipientName": "María García",
  "recipientPhone": "3001234567",
  "deliveryDate": "2026-05-16",
  "deliveryAddress": "Mostrador — Av 33 No. 54-52",
  "deliveryZone": "PICKUP",
  "subtotal": 85000,
  "deliveryCost": 0,
  "total": 85000,
  "paymentMethod": "CASH",
  "isPosOrder": true
}
```

La API crea el pedido normalmente. En el listado de pedidos del admin, los ítems personalizados muestran la descripción libre en lugar del nombre del producto.

### Validaciones

- Descripción requerida (mínimo 3 caracteres)
- Precio requerido y mayor a 0
- Método de pago requerido
- Si precio está vacío al intentar registrar: toast de error

### Estado de la pestaña

El estado de la pestaña activa (`catalog | custom`) es local al componente. Al cambiar de pestaña, el formulario anterior se limpia para evitar confusión.

---

## Librerías nuevas

| Librería | Uso | Alternativa considerada |
|----------|-----|------------------------|
| `exceljs` | Generación de Excel server-side | SheetJS (client-side, menos eficiente) |
| `@react-pdf/renderer` | Generación de PDF server-side | `jsPDF` (menos soporte para layouts complejos) |

---

## Lo que NO cambia

- Flujo de catálogo en el POS
- Página de reportes (KPIs, gráficas, tabla de productos)
- Integración con Google Sheets (se mantiene para quien quiera usarla)
- Cualquier otra sección del panel administrativo
