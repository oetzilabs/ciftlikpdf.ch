import { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { action, redirect } from "@solidjs/router";
import { withSession } from "../data/utils";
import { Donation } from "@ciftlikpdf/core/src/entities/donations";

export const donateAction = action(
  async (
    id: string,
    data: Omit<Parameters<typeof Sponsor.donate>[1], "createdByAdmin" | "deletedByAdmin" | "updatedByAdmin">,
  ) => {
    "use server";
    const [session] = await withSession();
    if (!session) {
      console.log("No session");
      throw redirect("/login", {
        status: 302,
        statusText: "You need to be logged in to donate",
      });
    }
    if (!session.user) {
      console.log("No user in session");
      throw redirect("/login", { status: 302, statusText: "You need to be logged in to donate" });
    }
    // check if the year is already taken
    const hasDonated = await Sponsor.hasDonated(id, data.year);
    if (hasDonated) {
      throw redirect(`/sponsors/${id}/donations/${hasDonated.id}`);
    } else {
      const donated = await Sponsor.donate(id, { ...data, createdByAdmin: session.user.id });
      return donated;
    }
  },
);

export const updateDonationAction = action(
  async (data: Omit<Parameters<typeof Donation.update>[0], "createdByAdmin" | "deletedByAdmin" | "updatedByAdmin">) => {
    "use server";
    const [session] = await withSession();
    if (!session) {
      console.log("No session");
      throw redirect("/login", {
        status: 302,
        statusText: "You need to be logged in to donate",
      });
    }
    if (!session.user) {
      console.log("No user in session");
      throw redirect("/login", { status: 302, statusText: "You need to be logged in to donate" });
    }
    const donated = await Donation.update({ ...data, updatedByAdmin: session.user.id });
    return donated;
  },
);

export const deleteDonationAction = action(async (id: string) => {
  "use server";
  const [session] = await withSession();
  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to donate",
    });
  }
  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to donate" });
  }
  const donated = await Donation.markAsDeleted({
    id,
  });
  return donated;
});

export const addSponsorAction = action(async (data: Parameters<typeof Sponsor.create>[0]) => {
  "use server";
  const [session] = await withSession();
  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to create a sponsor",
    });
  }
  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to create a sponsor" });
  }

  const exists = await Sponsor.findByName(data.name);
  if (exists) {
    return new Error("Sponsor with this name already exists");
  }

  const sponsor = await Sponsor.create(data);
  throw redirect(`/sponsors/${sponsor.id}`);
});

export const deleteSponsorAction = action(async (id: string) => {
  "use server";
  const [session] = await withSession();
  if (!session) {
    console.log("No session");
    throw redirect("/login", {
      status: 302,
      statusText: "You need to be logged in to delete a sponsor",
    });
  }
  if (!session.user) {
    console.log("No user in session");
    throw redirect("/login", { status: 302, statusText: "You need to be logged in to delete a sponsor" });
  }
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    return new Error("Sponsor not found");
  }
  const rr = await Sponsor.remove(id);
  if (!rr) {
    return new Error("Failed to delete sponsor");
  }
  throw redirect(`/`);
});
