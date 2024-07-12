import { Donation } from "@ciftlikpdf/core/src/entities/donations";
import { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { cache, redirect } from "@solidjs/router";

export const getAllSponsors = cache(async () => {
  "use server";
  const sponsors = await Sponsor.allWithoutDeleted();
  return sponsors;
}, "getAllSponsors");

export const getSponsor = cache(async (id: string) => {
  "use server";
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    return redirect("/404", {
      status: 404,
    });
  }
  return sponsor;
}, "getSponsor");

export const getSponsorDonation = cache(async (id: string, did: string) => {
  "use server";
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    return redirect("/404", {
      status: 404,
    });
  }
  const donation = await Donation.findById(did);
  if (!donation) {
    return redirect("/404", {
      status: 404,
    });
  }
  if (donation.sponsorId !== id) {
    console.log("donation.sponsorId !== id");
    return redirect("/404", {
      status: 404,
    });
  }
  return donation;
}, "getSponsorDonation");
