import type {
  Preorder,
  CreatePreorderInput,
  UpdatePreorderStatusInput,
  PreorderSource,
} from "@/types/preorder";
import { PREORDER_SOURCES } from "@/types/preorder";
import { MOCK_PREORDERS, MOCK_DISTRICTS, setMockPreorders, MOCK_PRODUCTS } from "./mock-data";
import { apiJson } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// ---------------------------------------------------------------------------
// EVERYTHING in the "real API" branches below is an UNCONFIRMED GUESS.
// There is no backend endpoint for pre-orders yet at all (see
// PROJECT_STATUS.md) — this mirrors the confirmed Orders API 1:1 as a
// starting point, on the assumption a pre-order will look like an order that
// hasn't shipped/been paid for yet. Do NOT trust this against a live backend
// until your backend friend confirms the actual DTOs and paths, the same way
// lib/api/orders.ts was rewritten once real Orders responses came back
// different from the first guess (camelCase nested district/thana, a
// statusHistory array, etc. — expect similar surprises here).
// ---------------------------------------------------------------------------

const SOURCE_PREFIX_RE = /^Source:\s*(\w+)\s*(?:—\s*)?/i;

function buildSpecialNotes(source: PreorderSource, notes?: string): string | undefined {
  const label = source.charAt(0).toUpperCase() + source.slice(1);
  const prefix = `Source: ${label}`;
  return notes ? `${prefix} — ${notes}` : prefix;
}

function splitSpecialNotes(raw: string | null | undefined): { source: PreorderSource; notes?: string } {
  if (!raw) return { source: "other" };
  const match = raw.match(SOURCE_PREFIX_RE);
  if (!match) return { source: "other", notes: raw };
  const candidate = match[1].toLowerCase();
  const source = (PREORDER_SOURCES as readonly string[]).includes(candidate)
    ? (candidate as PreorderSource)
    : "other";
  const rest = raw.slice(match[0].length).trim();
  return { source, notes: rest || undefined };
}

interface ApiPreorderItem {
  id: string;
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  variant_details?: { color?: string } | null;
  unit_price: string;
  quantity: number;
  total_price: string;
}

interface ApiPreorder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_district_id: string;
  shippingDistrict?: { id: string; name: string };
  shipping_thana_id?: string | null;
  shippingThana?: { id: string; name: string };
  shipping_address: string;
  billing_address?: string | null;
  total: string;
  special_notes?: string | null;
  cancellation_reason?: string | null;
  status: Preorder["status"];
  items: ApiPreorderItem[];
  created_at: string;
}

function fromApiPreorder(o: ApiPreorder): Preorder {
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
    items: (o.items ?? []).map((i) => ({
      id: String(i.id),
      productId: String(i.product_id),
      productName: i.product_name,
      variantId: i.product_variant_id ? String(i.product_variant_id) : undefined,
      color: i.variant_details?.color,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price),
    })),
    total: Number(o.total),
    createdAt: o.created_at,
  };
}

function toCreatePayload(data: CreatePreorderInput) {
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

export async function getPreorders(): Promise<Preorder[]> {
  if (USE_MOCKS) return MOCK_PREORDERS;

  // GUESSED path — confirm with backend friend.
  const data = await apiJson<ApiPreorder[]>("/preorders", {}, "Failed to fetch pre-orders");
  return data.map(fromApiPreorder);
}

export async function getPreorder(id: string): Promise<Preorder> {
  if (USE_MOCKS) {
    const found = MOCK_PREORDERS.find((o) => o.id === id);
    if (!found) throw new Error("Pre-order not found");
    return found;
  }

  const data = await apiJson<ApiPreorder>(`/preorders/${id}`, {}, "Failed to fetch pre-order");
  return fromApiPreorder(data);
}

export async function createPreorder(data: CreatePreorderInput): Promise<Preorder> {
  if (USE_MOCKS) {
    const district = MOCK_DISTRICTS.find((d) => d.id === data.districtId);
    const items = data.items.map((i) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === i.productId);
      const variant = product?.variants.find((v) => v.id === i.variantId);
      const unitPrice = variant?.price ?? product?.price ?? 0;
      return {
        id: `pre-item-${crypto.randomUUID()}`,
        productId: i.productId,
        productName: product?.name ?? "Unknown product",
        variantId: i.variantId,
        color: variant?.color,
        quantity: i.quantity,
        unitPrice,
        totalPrice: unitPrice * i.quantity,
      };
    });
    const newPreorder: Preorder = {
      id: `pre-${crypto.randomUUID()}`,
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
    setMockPreorders([...MOCK_PREORDERS, newPreorder]);
    return newPreorder;
  }

  const created = await apiJson<ApiPreorder>(
    "/preorders",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toCreatePayload(data)),
    },
    "Failed to create pre-order",
  );
  return fromApiPreorder(created);
}

export async function updatePreorderStatus(id: string, data: UpdatePreorderStatusInput): Promise<Preorder> {
  if (USE_MOCKS) {
    const index = MOCK_PREORDERS.findIndex((o) => o.id === id);
    if (index === -1) throw new Error("Pre-order not found");
    const updated = { ...MOCK_PREORDERS[index], status: data.status, cancellationReason: data.cancellationReason };
    const next = [...MOCK_PREORDERS];
    next[index] = updated;
    setMockPreorders(next);
    return updated;
  }

  const updated = await apiJson<ApiPreorder>(
    `/preorders/${id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: data.status,
        note: data.note,
        cancellation_reason: data.cancellationReason,
      }),
    },
    "Failed to update pre-order status",
  );
  return fromApiPreorder(updated);
}