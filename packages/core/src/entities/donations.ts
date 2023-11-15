import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorDonationsSelect, sponsors_donations } from "../drizzle/sql/schema";
import { Template } from "./templates";
import { Sponsor } from "../entities/sponsors";
import fetch from "node-fetch";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Bucket } from "sst/node/bucket";
import dayjs from "dayjs";
import tr from "dayjs/locale/tr";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

export * as Donation from "./donations";

export const create = z.function(z.tuple([createInsertSchema(sponsors_donations)])).implement(async (input) => {
  const [x] = await db.insert(sponsors_donations).values(input).returning();
  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${sponsors_donations.id})`,
    })
    .from(sponsors_donations);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
    with: {
      sponsor: true,
      createdBy: {
        columns: {
          password: false,
        },
      },
      updatedBy: {
        columns: {
          password: false,
        },
      },
      deletedBy: {
        columns: {
          password: false,
        },
      },
    },
  });
});

export const findBySponsorId = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.eq(fields.sponsorId, input),
    with: {
      sponsor: true,
      createdBy: {
        columns: {
          password: false,
        },
      },
      updatedBy: {
        columns: {
          password: false,
        },
      },
      deletedBy: {
        columns: {
          password: false,
        },
      },
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.sponsors_donations.findMany({
    with: {
      sponsor: true,
      createdBy: {
        columns: {
          password: false,
        },
      },
      updatedBy: {
        columns: {
          password: false,
        },
      },
      deletedBy: {
        columns: {
          password: false,
        },
      },
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(sponsors_donations)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    await db
      .update(sponsors_donations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sponsors_donations.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateAmount = z
  .function(z.tuple([z.object({ id: z.string().uuid(), amount: z.number() })]))
  .implement(async (input) => {
    return update({ id: input.id, amount: input.amount });
  });

export const isAllowedToSignUp = z.function(z.tuple([z.object({ email: z.string() })])).implement(async (input) => {
  return true;
});

export const createPDFFromTemplate = z
  .function(
    z.tuple([
      z.object({
        sponsorId: z.string().uuid(),
        donationId: z.string().uuid(),
      }),
    ])
  )
  .implement(async (input) => {
    const donation = await findById(input.donationId);
    if (!donation) {
      throw new Error("No sponsor found");
    }
    const sponsor = await Sponsor.findById(input.sponsorId);
    if (!sponsor) {
      throw new Error("No sponsor found");
    }
    // check if donation already has a pdf
    if (donation.s3Key) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
      });
      const pdfFileKey = `sponsor-pdf/${sponsor.id}/${donation.id}.pdf`;
      const getObjCommand = new GetObjectCommand({
        Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
        Key: pdfFileKey,
        ResponseContentDisposition: `attachment; filename="${donation.year}_${sponsor.name}.pdf"`,
      });
      const pdfFileUrl = getSignedUrl(s3Client, getObjCommand, {
        expiresIn: 60 * 60,
      });
      return pdfFileUrl;
    }
    const defaultTemplate = await Template.getDefault();
    if (!defaultTemplate) {
      throw new Error("No default template found");
    }
    const docxFile = await Template.download(defaultTemplate.Key);
    const url = process.env.DOCX_TO_PDF_URL;
    if (!url) throw new Error("No DOCX_TO_PDF_URL env var");
    const pdfFile = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        templateFile: docxFile.buffer,
        user: sponsor.name,
        addres: sponsor.address,
        amount: donation.amount,
        currency: donation.currency,
        year: donation.year,
        date: dayjs().locale(tr).format("Do MMMM YYYY"),
      }),
    });
    const pdfFileBuffer = await pdfFile.text().then((x) => Buffer.from(x, "base64"));
    const s3Client = new S3Client({
      region: "eu-central-1",
    });
    const pdfFileKey = `sponsor-pdf/${sponsor.id}/${donation.id}.pdf`;
    const putObjCommand = new PutObjectCommand({
      Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
      Key: pdfFileKey,
      Body: pdfFileBuffer,
    });
    await s3Client.send(putObjCommand);
    await update({ id: donation.id, s3Key: pdfFileKey });
    const getObjCommand = new GetObjectCommand({
      Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
      Key: pdfFileKey,
      ResponseContentDisposition: `attachment; filename="${donation.year}_${sponsor.name}.pdf"`,
    });
    const pdfFileUrl = getSignedUrl(s3Client, getObjCommand, {
      expiresIn: 60 * 60,
    });
    return pdfFileUrl;
  });

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = SponsorDonationsSelect;
