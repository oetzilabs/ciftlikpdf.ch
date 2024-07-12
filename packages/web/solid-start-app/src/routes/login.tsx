import { createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { TextField, TextFieldLabel, TextFieldRoot } from "../components/ui/textfield";
import { getAuthenticatedSession } from "@/data/auth";
import { login } from "@/actions/login";
import { Button } from "../components/ui/button";
import { createEffect, Show } from "solid-js";
import { createStore } from "solid-js/store";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function Login() {
  const session = createAsync(() => getAuthenticatedSession());
  const submission = useSubmission(login);

  const [user, setUser] = createStore<{
    name: string;
    password: string;
  }>({
    name: "",
    password: "",
  });

  const loginAction = useAction(login);

  return (
    <main class="text-center mx-auto p-4 pt-20 container">
      <Show when={session() && session()!.user && session()} keyed>
        {(session) => <p>Logged in as {session.user?.name}</p>}
      </Show>
      <div class="flex flex-col gap-4 w-max items-start justify-start">
        <TextFieldRoot class="w-[400px]" name="name" value={user.name} onChange={(value) => setUser("name", value)}>
          <TextFieldLabel>
            Username
            <TextField class="w-[400px]"></TextField>
          </TextFieldLabel>
        </TextFieldRoot>
        <TextFieldRoot
          class="w-[400px]"
          name="password"
          value={user.password}
          onChange={(value) => setUser("password", value)}
        >
          <TextFieldLabel>
            Password
            <TextField type="password" class="w-[400px]"></TextField>
          </TextFieldLabel>
        </TextFieldRoot>
        <div class="flex justify-end">
          <Button
            size="lg"
            onClick={async () => {
              const fd = new FormData();
              fd.append("name", user.name);
              fd.append("password", user.password);
              await loginAction(fd);
              await revalidate(getAuthenticatedSession.key);
            }}
          >
            Login
          </Button>
        </div>
        <Show when={submission.result}>{(result) => <p>{result().message}</p>}</Show>
      </div>
    </main>
  );
}
