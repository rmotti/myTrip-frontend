// services/authHeaders.ts
import { getAuth } from "firebase/auth";

export async function buildAuthHeaders() {
  const headers = new Headers();
  headers.set("Accept", "application/json"); // seguro em GET

  const token = await getAuth().currentUser?.getIdToken?.();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return headers;
}
