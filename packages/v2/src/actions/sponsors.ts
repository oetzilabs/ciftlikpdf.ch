import { withSession } from "@/data/utils";
import { Donation } from "@ciftlikpdf/core/src/entities/donations";
import { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { action, redirect } from "@solidjs/router";

export const donateAction = action(async (id: string, data: Omit<Parameters<typeof Sponsor.donate>[1], "admin_id">) => {
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
  }

  const donated = await Sponsor.donate(id, { ...data, admin_id: session.user.id });
  return donated;
});

export const updateDonationAction = action(async (data: Omit<Parameters<typeof Donation.update>[0], "admin_id">) => {
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

  const donated = await Donation.update({ ...data, admin_id: session.user.id });
  return donated;
});

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

  for (const donation of sponsor.donations) {
    await Donation.remove(donation.id);
  }

  const rr = await Sponsor.remove(id);

  if (!rr) {
    return new Error("Failed to delete sponsor");
  }

  return;
});

export const updateSponsorAction = action(async (data: Parameters<typeof Sponsor.update>[0]) => {
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

  const sponsor = await Sponsor.findById(data.id);
  if (!sponsor) {
    return new Error("Sponsor not found");
  }

  const rr = await Sponsor.update({
    ...data,
  });

  if (!rr) {
    return new Error("Failed to update sponsor");
  }

  throw redirect(`/sponsors/${data.id}`);
});

export const createSponsorBatchAction = action(
  async (
    data: (Parameters<typeof Sponsor.create>[0] & {
      donations: Omit<Parameters<typeof Donation.create>[0], "admin_id" | "sponsorId">[];
    })[]
  ) => {
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

    for (const sponsor of data) {
      let exists = await Sponsor.findByName(sponsor.name);
      if (exists) {
        // update the existing one
        await Sponsor.update({
          ...sponsor,
          id: exists.id!,
        });
      } else {
        // create the new one
        exists = await Sponsor.create(sponsor);
      }
      // add the donations
      for (const donation of sponsor.donations) {
        const existsDonation = await Donation.findBySponsorIdAndYear(exists!.id, donation.year);
        if (existsDonation) {
          await Donation.update({ id: existsDonation.id, amount: donation.amount, deletedAt: null });
        } else {
          await Donation.create({ ...donation, admin_id: session.user.id, sponsorId: exists!.id });
        }
      }
    }
    return data;
  }
);
