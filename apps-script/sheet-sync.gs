/**
 * Floristeria Deco Imperio - Sheet Sync
 * Receives JSON from the Next.js app and writes to dedicated tabs.
 */

const SHARED_SECRET = "e67fe661beb1c76fc9e50b50a938b18ef11f306d4d9e565f";

const SHEETS = {
  Usuarios:    ["id", "email", "password_plano", "passwordHash", "name", "phone", "role", "active", "createdAt"],
  Productos:   ["id", "slug", "name", "tagline", "basePrice", "categoryName", "stock", "salesCount", "featured", "active", "createdAt"],
  Categorias:  ["id", "slug", "name", "description", "active", "sortOrder"],
  Ocasiones:   ["id", "slug", "name", "description", "active", "sortOrder"],
  Pedidos:     ["orderNumber", "createdAt", "status", "paymentMethod", "paymentStatus", "customerName", "customerEmail", "recipientName", "recipientPhone", "deliveryAddress", "neighborhood", "city", "deliveryDate", "subtotal", "shippingCost", "discount", "total", "couponCode", "cardMessage"],
  PedidoItems: ["orderNumber", "productName", "size", "quantity", "unitPrice", "subtotal", "dedication"],
  Historial:   ["orderNumber", "status", "note", "changedBy", "timestamp"],
  Direcciones: ["id", "userEmail", "label", "street", "neighborhood", "city", "department", "isDefault"],
  Cupones:     ["code", "discountType", "discountValue", "minOrderAmount", "maxUses", "usedCount", "active", "expiresAt"],
  Favoritos:   ["userEmail", "productName", "createdAt"],
  Resumen:     ["metrica", "valor"]
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SHARED_SECRET) {
      return jsonResponse({ ok: false, error: "Invalid secret" });
    }
    if (body.type === "full-sync")     return handleFullSync(body.data);
    if (body.type === "order-created") return handleNewOrder(body.data);
    return jsonResponse({ ok: false, error: "Unknown type: " + body.type });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "Floristeria sheet-sync alive" });
}

function handleFullSync(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var writers = {
    Usuarios:    (data.users      || []).map(function (u) { return [u.id, u.email, u.passwordPlain || "", u.passwordHash || "", u.name, u.phone || "", u.role, u.active, u.createdAt]; }),
    Productos:   (data.products   || []).map(function (p) { return [p.id, p.slug, p.name, p.tagline || "", p.basePrice, p.categoryName || "", p.stock, p.salesCount, p.featured, p.active, p.createdAt]; }),
    Categorias:  (data.categories || []).map(function (c) { return [c.id, c.slug, c.name, c.description || "", c.active, c.sortOrder]; }),
    Ocasiones:   (data.occasions  || []).map(function (o) { return [o.id, o.slug, o.name, o.description || "", o.active, o.sortOrder]; }),
    Pedidos:     (data.orders     || []).map(function (o) { return [o.orderNumber, o.createdAt, o.status, o.paymentMethod, o.paymentStatus, o.customerName || "", o.customerEmail || "", o.recipientName, o.recipientPhone, o.deliveryAddress || "", o.neighborhood || "", o.city, o.deliveryDate || "", o.subtotal, o.shippingCost, o.discount, o.total, o.couponCode || "", o.cardMessage || ""]; }),
    PedidoItems: (data.orderItems || []).map(function (i) { return [i.orderNumber, i.productName, i.size || "", i.quantity, i.unitPrice, i.subtotal, i.dedication || ""]; }),
    Historial:   (data.statusHistory || []).map(function (h) { return [h.orderNumber, h.status, h.note || "", h.changedBy || "", h.timestamp]; }),
    Direcciones: (data.addresses  || []).map(function (a) { return [a.id, a.userEmail || "", a.label, a.street, a.neighborhood || "", a.city, a.department, a.isDefault]; }),
    Cupones:     (data.coupons    || []).map(function (c) { return [c.code, c.discountType, c.discountValue, c.minOrderAmount || "", c.maxUses || "", c.usedCount, c.active, c.expiresAt || ""]; }),
    Favoritos:   (data.favorites  || []).map(function (f) { return [f.userEmail || "", f.productName || "", f.createdAt]; }),
    Resumen:     (data.summary    || []).map(function (s) { return [s.metric, s.value]; })
  };

  Object.keys(SHEETS).forEach(function (name) {
    writeSheet(ss, name, SHEETS[name], writers[name] || []);
  });

  return jsonResponse({ ok: true, synced: Object.keys(SHEETS), at: new Date().toISOString() });
}

function handleNewOrder(order) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = getOrCreateSheet(ss, "Pedidos", SHEETS.Pedidos);
  orderSheet.appendRow([
    order.orderNumber, order.createdAt, order.status, order.paymentMethod, order.paymentStatus,
    order.customerName || "", order.customerEmail || "", order.recipientName, order.recipientPhone,
    order.deliveryAddress || "", order.neighborhood || "", order.city, order.deliveryDate || "",
    order.subtotal, order.shippingCost, order.discount, order.total,
    order.couponCode || "", order.cardMessage || ""
  ]);
  var itemSheet = getOrCreateSheet(ss, "PedidoItems", SHEETS.PedidoItems);
  (order.items || []).forEach(function (i) {
    itemSheet.appendRow([order.orderNumber, i.productName, i.size || "", i.quantity, i.unitPrice, i.subtotal, i.dedication || ""]);
  });
  return jsonResponse({ ok: true, orderNumber: order.orderNumber });
}

function writeSheet(ss, name, headers, rows) {
  var sheet = getOrCreateSheet(ss, name, headers);
  sheet.clear();
  sheet.appendRow(headers);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#1F3A2E")
    .setFontColor("#FAF7F2");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#1F3A2E")
      .setFontColor("#FAF7F2");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
