import { atom } from "nanostores";

export const api_url = atom<string>("");

export default function Providers(props: {
  API_URL: string;
}) {
  api_url.set(props.API_URL);
  return <></>;
}
