import { Sponsor } from "@ciftlikpdf/core/entities/sponsors";
import { StatusCodes } from "http-status-codes";
import { ApiHandler, useFormData, usePathParam, useQueryParam } from "sst/node/api";
import { error, getUser, json, text } from "./utils";

export const get = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No sponsor id");
  }
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    return error("Sponsor not found", StatusCodes.NOT_FOUND);
  }
  return json(sponsor);
});

export const create = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const validation = await Sponsor.isCreateValid(body);
  if (!validation.success) {
    return error(validation.error.message);
  }

  const sponsor = await Sponsor.create(validation.data);
  return json(sponsor);
});

export const createWithDonation = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const data = Object.fromEntries(body.entries());
  const validation = await Sponsor.isCreateWithDonationValid({ ...data, createdByAdmin: user.id });
  if (!validation.success) {
    console.error(validation.error);
    return error(validation.error.message);
  }

  const sponsor = await Sponsor.createWithDonation(validation.data);
  return json(sponsor);
});

export const donate = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No sponsor id");
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const data = Object.fromEntries(body.entries());

  const validation = await Sponsor.isDonateValid({
    ...data,
    createdByAdmin: user.id,
  });
  if (!validation.success) {
    console.error(validation.error);
    return error(validation.error.message);
  }

  const sponsor = await Sponsor.donate(id, validation.data);
  return json(sponsor);
});

export const all = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const filter = useQueryParam("filter");
  if (!filter) {
    const sponsors = await Sponsor.all().catch((e) => []);
    return json(sponsors);
  }
  if (filter === "non-deleted") {
    const sponsors = await Sponsor.allWithoutDeleted().catch((e) => []);
    return json(sponsors);
  }

  return error("Invalid filter");
});

export const update = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No sponsor id");
  }
  const sponsor = await Sponsor.findById(id);
  if (!sponsor) {
    return error("Sponsor not found", StatusCodes.NOT_FOUND);
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const data = Object.fromEntries(body.entries());
  const validation = await Sponsor.isUpdateValid({ ...data, id });
  if (!validation.success) {
    return error(validation.error.message);
  }
  const updatedSponsor = await Sponsor.update(validation.data);
  // invalidate old donations
  await Sponsor.invalidateDonations(updatedSponsor.id);
  return json(updatedSponsor);
});

export const updateDonation = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }

  const sponsorId = usePathParam("id");
  if (!sponsorId) {
    return error("No sponsor id");
  }
  const donationId = usePathParam("did");
  if (!donationId) {
    return error("No donation id");
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const data = Object.fromEntries(body.entries());
  const validation = await Sponsor.isUpdateDonationValid({
    ...data,
    sponsorId,
    id: donationId,
    updatedByAdmin: user.id,
  });
  if (!validation.success) {
    return error(validation.error.message);
  }
  const updatedDonation = await Sponsor.updateDonation(sponsorId, donationId, validation.data);
  return json(updatedDonation);
});

export const removeDonation = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }

  const sponsorId = usePathParam("id");
  if (!sponsorId) {
    return error("No sponsor id");
  }
  const donationId = usePathParam("did");
  if (!donationId) {
    return error("No donation id");
  }
  const removedDonation = await Sponsor.removeDonation(sponsorId, donationId, user.id);
  return json(removedDonation);
});

export const remove = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }

  const id = usePathParam("id");
  if (!id) {
    return error("No sponsor id");
  }
  const removedSponsor = await Sponsor.remove(id);
  return json(removedSponsor);
});

export const count = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const filter = useQueryParam("filter");
  if (!filter) {
    const count = await Sponsor.countAll();
    return json({ count });
  }
  if (filter === "non-deleted") {
    const count = await Sponsor.countAllWithoutDeleted();
    return json({ count });
  }

  return error("Invalid filter");
});

export const donationPdf = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }

  const sponsorId = usePathParam("id");
  if (!sponsorId) {
    return error("No sponsor id");
  }
  const donationId = usePathParam("did");
  if (!donationId) {
    return error("No donation id");
  }
  try {
    const pdfDownloadUrl = await Sponsor.createPDF(sponsorId, donationId);
    return text(pdfDownloadUrl);
  } catch (e) {
    const er = e as Error;
    return error(er.message);
  }

  return error("Unexpected error");
});
