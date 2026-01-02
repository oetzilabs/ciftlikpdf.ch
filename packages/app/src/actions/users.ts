import { withSession } from "@/data/utils";
import { User } from "@ciftlikpdf/core/src/entities/users";
import { action, redirect } from "@solidjs/router";


export const addUserAction = action(async (data: Parameters<typeof User.create>[0]) => {
  "use server";
  const [session] = await withSession();

  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to create a user",
    });
  }

  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to create a user" });
  }

  const exists = await User.findByName(data.name);
  if (exists) {
    return new Error("User with this name already exists");
  }

  const user = await User.create(data);
  throw redirect(`/users/${user.id}`);
});

export const deleteUserAction = action(async (id: string) => {
  "use server";
  const [session] = await withSession();

  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to delete a user",
    });
  }

  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to delete a user" });
  }

  const user = await User.findById(id);

  if (!user) {
    return new Error("User not found");
  }

  const rr = await User.remove(id);

  if (!rr) {
    return new Error("Failed to delete user");
  }

  throw redirect(`/`);
});

export const updateUserAction = action(async (data: Parameters<typeof User.update>[0]) => {
  "use server";
  const [session] = await withSession();

  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to delete a user",
    });
  }
  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to delete a user" });
  }

  const user = await User.findById(data.id);
  if (!user) {
    return new Error("User not found");
  }

  const rr = await User.update({
    ...data,
  });

  if (!rr) {
    return new Error("Failed to update user");
  }

  throw redirect(`/users/${data.id}`);
});

