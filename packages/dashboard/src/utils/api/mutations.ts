import { PDF } from "@ciftlikpdf/core/entities/pdfs";
import { Sponsor } from "@ciftlikpdf/core/entities/sponsors";
import { Template } from "@ciftlikpdf/core/entities/templates";
import { Superuser } from "@ciftlikpdf/core/entities/superadmins";
import { z } from "zod";
import { User } from "@ciftlikpdf/core/entities/users";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;
const DOCX_TO_PDF_API = import.meta.env.VITE_DOCX_TO_PDF_URL;

export const Sponsors = {
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/sponsors/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Sponsor.remove>)
  ),
  createWithDonation: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          name: z.string(),
          address: z.string(),
          amount: z.number().transform((x) => x.toString()),
          currency: z.union([z.literal("CHF"), z.literal("EUR")]),
          year: z.number().transform((x) => x.toString()),
        }),
      ])
    )
    .implement(async (token, data) =>
      fetch(`${API_BASE}/sponsors`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.createWithDonation>)
    ),
  createPDF: z
    .function(
      z.tuple([
        z.string(),
        z.string().uuid(),
        z.string().uuid(),
        z.string(),
        z.object({
          user: z.string(),
          addres: z.string(),
          amount: z.number().transform((x) => x.toString()),
          currency: z.string(),
          year: z.number().transform((x) => x.toString()),
          date: z.string(),
        }),
      ])
    )
    .implement(async (token, sponsorId, donationId, templateFileName, data) =>
      fetch(DOCX_TO_PDF_API, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, sid: sponsorId, did: donationId, templateFile: templateFileName }),
      }).then(
        (res) =>
          res.json() as Promise<{
            pdfUrl: string;
          }>
      )
    ),
  testDocker: z.function(z.tuple([])).implement(async () =>
    fetch(DOCX_TO_PDF_API, {
      method: "POST",
    }).then((res) => res.json())
  ),
  donate: z
    .function(
      z.tuple([
        z.string(),
        z.string().uuid(),
        z.object({
          amount: z.number().transform((x) => x.toString()),
          currency: z.union([z.literal("CHF"), z.literal("EUR")]),
          year: z.number().transform((x) => x.toString()),
        }),
      ])
    )
    .implement(async (token, sponsorId, data) =>
      fetch(`${API_BASE}/sponsor/${sponsorId}/donate`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.createWithDonation>)
    ),
  updateDonation: z
    .function(
      z.tuple([
        z.string(),
        z.string().uuid(),
        z.object({
          id: z.string().uuid(),
          amount: z.number().transform((x) => x.toString()),
          currency: z.union([z.literal("CHF"), z.literal("EUR")]),
          year: z.number().transform((x) => x.toString()),
        }),
      ])
    )
    .implement(async (token, sponsorId, data) =>
      fetch(`${API_BASE}/sponsor/${sponsorId}/donate/${data.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.updateDonation>)
    ),
  removeDonation: z
    .function(z.tuple([z.string(), z.string().uuid(), z.string().uuid()]))
    .implement(async (token, sponsorId, donationId) =>
      fetch(`${API_BASE}/sponsor/${sponsorId}/donate/${donationId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json() as ReturnType<typeof Sponsor.removeDonation>)
    ),
  update: z
    .function(
      z.tuple([
        z.string(),
        z.string().uuid(),
        z.object({
          name: z.string(),
          address: z.string(),
        }),
      ])
    )
    .implement(async (token, sponsorId, data) =>
      fetch(`${API_BASE}/sponsors/${sponsorId}/update`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.update>)
    ),
};

export const Templates = {
  presignedUrl: z.function(z.tuple([z.string(), z.string()])).implement(async (token, templateName) =>
    fetch(`${API_BASE}/templates/presigned-url`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: new URLSearchParams({
        templateName,
      }),
    }).then((res) => res.json() as Promise<{ url: string }>)
  ),
  upload: z.function(z.tuple([z.string(), z.any()])).implement(async (url, formData) =>
    fetch(url, {
      method: "PUT",
      body: formData,
    }).then((res) => Promise.resolve(true))
  ),
  setAsDefault: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/templates/${id}/set-default`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Template.setAsDefault>)
  ),
  syncOld: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/templates/sync-old`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Template.all>)
  ),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/templates/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Template.remove>)
  ),
};

export const PDFs = {
  downloadUrl: z.function(z.tuple([z.string(), z.string()])).implement(async (token, key) =>
    fetch(`${API_BASE}/pdfs/download-url?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof PDF.downloadUrl>)
  ),
  remove: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/pdfs/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof PDF.remove>)
  ),
  removeByKey: z.function(z.tuple([z.string(), z.string()])).implement(async (token, key) =>
    fetch(`${API_BASE}/pdfs/by-key?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof PDF.remove>)
  ),
};

export const Superadmins = {
  updateUser: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          password: z.string(),
        }),
      ])
    )
    .implement(async (token, data) =>
      fetch(`${API_BASE}/superadmin/update-user`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams(data),
      }).then((res) => res.json() as ReturnType<typeof Superuser.updateUser>)
    ),
  makeAdmin: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/superadmin/user/${id}/make-admin`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Superuser.makeAdmin>)
  ),
  makeViewer: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/superadmin/user/${id}/make-viewer`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Superuser.makeViewer>)
  ),
  makeSuperAdmin: z.function(z.tuple([z.string(), z.string().uuid()])).implement(async (token, id) =>
    fetch(`${API_BASE}/superadmin/user/${id}/make-superadmin`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Superuser.makeSuperadmin>)
  ),
};
