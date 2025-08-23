export const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function getPlanTypes() {
  const r = await fetch(`${API_BASE}/api/plan-types`, { cache: 'no-store' });
  return r.json();
}

export async function searchSpaces(payload: any) {
  const r = await fetch(`${API_BASE}/api/search`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}

export async function getSpace(spaceId: string) {
  const r = await fetch(`${API_BASE}/api/spaces/${spaceId}`, { cache: 'no-store' });
  return r.json();
}

export async function createReservation(payload: any) {
  const r = await fetch(`${API_BASE}/api/reservations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json();
}
