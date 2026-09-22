import type { District, Thana } from "@/types/location";
import { MOCK_DISTRICTS, MOCK_THANAS } from "./mock-data";
import { apiJson } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

interface ApiDistrict {
  id: string;
  name: string;
  delivery_charge: number;
}

interface ApiThana {
  id: string;
  name: string;
}

function fromApiDistrict(d: ApiDistrict): District {
  return { id: String(d.id), name: d.name, deliveryCharge: Number(d.delivery_charge) };
}

function fromApiThana(t: ApiThana): Thana {
  return { id: String(t.id), name: t.name };
}

// A plain GET /districts (list-all) is ASSUMED to exist, following the same
// convention as categories/products — the paths list shared so far only
// confirmed GET /districts/{id} directly. Worth a quick check; if it's wrong,
// this is the only function that needs to change.
export async function getDistricts(): Promise<District[]> {
  if (USE_MOCKS) return MOCK_DISTRICTS;

  const data = await apiJson<ApiDistrict[]>("/districts", {}, "Failed to fetch districts");
  return data.map(fromApiDistrict);
}

// Confirmed: GET /districts/{id}/thanas — public, used at checkout.
export async function getThanas(districtId: string): Promise<Thana[]> {
  if (USE_MOCKS) return MOCK_THANAS[districtId] ?? [];

  const data = await apiJson<ApiThana[]>(
    `/districts/${districtId}/thanas`,
    {},
    "Failed to fetch thanas",
  );
  return data.map(fromApiThana);
}