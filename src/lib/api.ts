export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type PlanType = {
  plan_type_id: number;
  code: string;
  name_ja: string;
  unit_days: number;
};

type SearchParams = {
  plan_code: string;
  start_date: string;
  units: number;
  max_price_total?: number;
  min_wifi_mbps?: number;
  category?: string;
  private_room_required?: boolean;
};

type SpaceResult = {
  space_id: string;
  name: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  capacity_total: number;
  category: string;
  plan: {
    plan_code: string;
    plan_name: string;
    unit_days: number;
    units: number;
    price_total: number;
    start_date: string;
    end_date: string;
  };
};

type ReservationCreate = {
  user_name: string;
  user_email: string;
  space_id: string;
  plan_code: string;
  start_date: string;
  units: number;
};

type ReservationResult = {
  reservation_id: number;
  user_name: string;
  user_email: string;
  space_id: string;
  plan_type_id: number;
  start_date: string;
  units: number;
  end_date: string;
  price_total: number;
  status: string;
  error?: string; // ← 追加
};

type Space = {
  name: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  capacity_total: number;
  category: string;
};

type Plan = {
  plan_code: string;
  plan_name: string;
  price_tax_included: number;
};

type ReserveData = {
  space: Space;
  plans: Plan[];
};

export async function fetchPlanTypes(): Promise<PlanType[]> {
  const res = await fetch("/api/plan-types");
  if (!res.ok) throw new Error("API error");
  return await res.json();
}

export async function getPlanTypes(): Promise<PlanType[]> {
  const r = await fetch(`${API_BASE}/api/plan-types`, { cache: 'no-store' });
  return r.json();
}

export async function searchSpaces(payload: SearchParams): Promise<SpaceResult[]> {
  const r = await fetch(`${API_BASE}/api/search`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function getSpace(spaceId: string): Promise<ReserveData> {
  const r = await fetch(`${API_BASE}/api/spaces/${spaceId}`, { cache: 'no-store' });
  return r.json();
}

export async function createReservation(payload: ReservationCreate): Promise<ReservationResult> {
  const r = await fetch(`${API_BASE}/api/reservations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}
