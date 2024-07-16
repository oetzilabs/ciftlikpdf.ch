import { User } from "@ciftlikpdf/core/src/entities/users";
import { cache, redirect } from "@solidjs/router";

export const getAllUsers = cache(async () => {
  "use server";
  const users = await User.all();
  return users;
}, "getAllUserss");

export const getUser = cache(async (id: string) => {
  "use server";
  const user = await User.findById(id);
  if (!user) {
    console.log("User not found");
    return redirect("/404", {
      status: 404,
    });
  }
  return user;
}, "getUser");
