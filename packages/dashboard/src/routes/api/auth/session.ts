import { APIEvent, json } from "solid-start";

export const GET = async (event: APIEvent) => {
  // get the access_token from the headers
  const headers = event.request.headers;
  const token = headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Error("Token missing");
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}` + "/session", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((r) => r.json());

  return json({
    session: response,
  });
};
