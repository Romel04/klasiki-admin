import type { Order, CreateOrderInput, UpdateOrderStatusInput, OrderSource } from "@/types/order";
import { ORDER_SOURCES } from "@/types/order";
import { MOCK_ORDERS, MOCK_DISTRICTS, setMockOrders, MOCK_PRODUCTS } from "./mock-data";
import { apiJson } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// ---------------------------------------------------------------------------
// Confirmed live against a real created order (2026-09-22). The response
// shape is quite different from the original guess — notably: nested
// district/thana come back camelCase (shippingDistrict/shippingThana, same
// surprise as productVariants earlier), there's a real order_number and a
// full money breakdown (subtotal/discount_amount/delivery_charge/total), and
// a statusHistory array recording every status change with its `note`.
// Still unconfirmed: the exact status-update endpoint path (guessed
// PATCH /orders/{id}/status — untested).
// ---------------------------------------------------------------------------

// Confirmed: CreateOrderDto has no source/channel field. We prefix
// special_notes with "Source: X" instead of inventing a field that doesn't
// exist on the backend.
const SOURCE_PREFIX_RE = /^Source:\s*(\w+)\s*(?:—\s*)?/i;

function buildSpecialNotes(source: OrderSource, notes?: string): string | undefined {
  const label = source.charAt(0).toUpperCase() + source.slice(1);
  const prefix = `Source: ${label}`;
  return notes ? `${prefix} — ${notes}` : prefix;
}

function splitSpecialNotes(raw: string | null | undefined): { source: OrderSource; notes?: string } {
  if (!raw) return { source: "other" };
  const match = raw.match(SOURCE_PREFIX_RE);
  if (!match) return { source: "other", notes: raw };
  const candidate = match[1].toLowerCase();
  const source = (ORDER_SOURCES as readonly string[]).includes(candidate)
    ? (candidate as OrderSource)
    : "other";
  const rest = raw.slice(match[0].length).trim();
  return { source, notes: rest || undefined };
}

// A created order's item already comes back with a denormalized
// product_name like "Test Bag (Red)" — strip a trailing "(Color)" so we don't
// show the color twice when it's already broken out into its own column.
function stripColorSuffix(name: string, color?: string): string {
  if (!color) return name;
  return name.replace(new RegExp(`\\s*\\(${color}\\)\\s*$`, "i"), "");
}

interface ApiOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  variant_details?: { color?: string } | null;
  unit_price: string;
  quantity: number;
  total_price: string;
}

interface ApiOrderStatusHistoryEntry {
  id: string;
  status: Order["status"];
  note: string | null;
  created_at: string;
}

interface ApiOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_district_id: string;
  shippingDistrict?: { id: string; name: string; delivery_charge: string };
  shipping_thana_id?: string | null;
  shippingThana?: { id: string; district_id: string; name: string };
  shipping_address: string;
  billing_address?: string | null;
  payment_method: string;
  subtotal: string;
  discount_amount: string;
  delivery_charge: string;
  total: string;
  special_notes?: string | null;
  // NOT confirmed against Swagger — the Order entity/DTOs we've seen so far
  // have no admin-only note field at all. This is a guessed column name for
  // when the backend adds one; until then updateOrderAdminNote() below will
  // 404/fail against the real API. Ask the backend dev to add an
  // `admin_note` (text, nullable) column + a way to PATCH it.
  admin_note?: string | null;
  cancellation_reason?: string | null;
  status: Order["status"];
  items: ApiOrderItem[];
  statusHistory?: ApiOrderStatusHistoryEntry[];
  created_at: string;
}

function fromApiOrder(o: ApiOrder): Order {
  const { source, notes } = splitSpecialNotes(o.special_notes);
  return {
    id: String(o.id),
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email ?? undefined,
    shippingAddress: o.shipping_address,
    billingAddress: o.billing_address ?? undefined,
    districtId: String(o.shipping_district_id),
    districtName: o.shippingDistrict?.name ?? "Unknown",
    thanaId: o.shipping_thana_id ? String(o.shipping_thana_id) : undefined,
    thanaName: o.shippingThana?.name,
    source,
    specialNotes: notes,
    status: o.status,
    cancellationReason: o.cancellation_reason ?? undefined,
    adminNote: o.admin_note ?? undefined,
    items: (o.items ?? []).map((i) => {
      const color = i.variant_details?.color;
      return {
        id: String(i.id),
        productId: String(i.product_id),
        productName: stripColorSuffix(i.product_name, color),
        variantId: i.product_variant_id ? String(i.product_variant_id) : undefined,
        color,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        totalPrice: Number(i.total_price),
      };
    }),
    total: Number(o.total),
    createdAt: o.created_at,
  };
}

// Matches CreateOrderDto exactly (confirmed against Swagger).
function toCreatePayload(data: CreateOrderInput) {
  return {
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    customer_email: data.customerEmail || undefined,
    shipping_district_id: Number(data.districtId),
    shipping_thana_id: data.thanaId ? Number(data.thanaId) : undefined,
    shipping_address: data.shippingAddress,
    billing_address: data.billingAddress || undefined,
    special_notes: buildSpecialNotes(data.source, data.specialNotes),
    items: data.items.map((i) => ({
      product_id: Number(i.productId),
      product_variant_id: i.variantId ? Number(i.variantId) : undefined,
      quantity: i.quantity,
    })),
  };
}

// --- Public API --------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  if (USE_MOCKS) return MOCK_ORDERS;

  const data = await apiJson<ApiOrder[]>("/orders", {}, "Failed to fetch orders");
  return data.map(fromApiOrder);
}

export async function getOrder(id: string): Promise<Order> {
  if (USE_MOCKS) {
    const found = MOCK_ORDERS.find((o) => o.id === id);
    if (!found) throw new Error("Order not found");
    return found;
  }

  const data = await apiJson<ApiOrder>(`/orders/${id}`, {}, "Failed to fetch order");
  return fromApiOrder(data);
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  if (USE_MOCKS) {
    const district = MOCK_DISTRICTS.find((d) => d.id === data.districtId);
    const items = data.items.map((i) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === i.productId);
      const variant = product?.variants.find((v) => v.id === i.variantId);
      const unitPrice = product?.price ?? 0;
      return {
        id: `item-${crypto.randomUUID()}`,
        productId: i.productId,
        productName: product?.name ?? "Unknown product",
        variantId: i.variantId,
        color: variant?.color,
        quantity: i.quantity,
        unitPrice,
        totalPrice: unitPrice * i.quantity,
      };
    });
    const newOrder: Order = {
      id: `ord-${crypto.randomUUID()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      districtId: data.districtId,
      districtName: district?.name ?? "Unknown",
      thanaId: data.thanaId,
      source: data.source,
      specialNotes: data.specialNotes,
      status: "pending",
      items,
      total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      createdAt: new Date().toISOString(),
    };
    setMockOrders([...MOCK_ORDERS, newOrder]);
    return newOrder;
  }

  const created = await apiJson<ApiOrder>(
    "/orders",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toCreatePayload(data)),
    },
    "Failed to create order",
  );
  return fromApiOrder(created);
}

// Endpoint path NOT confirmed yet — guessed as a dedicated status
// sub-resource matching the DTO's name. If this 404s, it's very likely just
// PATCH /orders/{id} instead — check Swagger's Orders paths list.
export async function updateOrderStatus(id: string, data: UpdateOrderStatusInput): Promise<Order> {
  if (USE_MOCKS) {
    const index = MOCK_ORDERS.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Order not found");
    const updated = { ...MOCK_ORDERS[index], status: data.status, cancellationReason: data.cancellationReason };
    const next = [...MOCK_ORDERS];
    next[index] = updated;
    setMockOrders(next);
    return updated;
  }

  const updated = await apiJson<ApiOrder>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: data.status,
        note: data.note,
        cancellation_reason: data.cancellationReason,
      }),
    },
    "Failed to update order status",
  );
  return fromApiOrder(updated);
}

// NOT CONFIRMED against Swagger — there is currently no known backend field
// or endpoint for a private admin-only note on an order (the only "note" the
// backend has is the status-change note, which lands in statusHistory and
// may be customer-visible via order tracking). This guesses a generic
// PATCH /orders/{id} with an `admin_note` field. Until the backend adds a
// real column + accepts this on the update endpoint, this call will fail
// against the live API — flag to your backend friend and adjust the path/
// field name here once confirmed.
export async function updateOrderAdminNote(id: string, adminNote: string): Promise<Order> {
  if (USE_MOCKS) {
    const index = MOCK_ORDERS.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Order not found");
    const updated = { ...MOCK_ORDERS[index], adminNote };
    const next = [...MOCK_ORDERS];
    next[index] = updated;
    setMockOrders(next);
    return updated;
  }

  const updated = await apiJson<ApiOrder>(
    `/orders/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_note: adminNote }),
    },
    "Failed to save admin note",
  );
  return fromApiOrder(updated);
}