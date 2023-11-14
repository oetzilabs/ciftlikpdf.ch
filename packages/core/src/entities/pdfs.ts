import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorDonationsSelect, sponsors_donations } from "../drizzle/sql/schema";
import { eq } from "drizzle-orm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export * as PDF from "./pdfs";

export const all = z.function(z.tuple([])).implement(async () => {
  // s3 client
  // get all pdfs

  const client = new S3Client({ region: "eu-central-1" });
  const command = new ListObjectsV2Command({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Prefix: "sponsor-pdf/",
  });
  const response = await client.send(command);
  // i only need the keys
  const keys = response.Contents?.map((x) => x.Key!) ?? [];
  const listOfDonations = [];
  for (const key of keys) {
    const donation = await db.query.sponsors_donations.findFirst({
      where: (fields, operations) => operations.eq(fields.s3Key, key),
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
      },
    });
    if (donation) {
      listOfDonations.push(donation);
    }
  }
  return listOfDonations;
});

export const remove = z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
  const y = await db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.and(operations.eq(fields.id, id), operations.isNotNull(fields.s3Key)),
  });
  if (!y) throw new Error("not found");

  const client = new S3Client({ region: "eu-central-1" });

  const command = new DeleteObjectCommand({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Key: y?.s3Key!,
  });
  const response = await client.send(command);

  const [x] = await db.delete(sponsors_donations).where(eq(sponsors_donations.id, y.id)).returning();

  return [response, x] as const;
});

export const downloadUrl = z.function(z.tuple([z.string()])).implement(async (id) => {
  const x = await db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.and(operations.eq(fields.id, id), operations.isNotNull(fields.s3Key)),
    with: {
      sponsor: true,
    },
  });
  if (!x) throw new Error("not found");
  if (!x.s3Key) throw new Error("The PDF has not been generated yet");
  // presigned url
  const client = new S3Client({ region: "eu-central-1" });
  const getFileCommand = new GetObjectCommand({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Key: x.s3Key!,
  });

  const downloadUrl = await getSignedUrl(client, getFileCommand, {
    expiresIn: 60 * 60 * 24 * 7,
  });
  // non-character regex
  const regex = /[^a-zA-Z0-9]/g;
  return {
    url: downloadUrl,
    fileName: `${x.sponsor.name.replaceAll(regex, "-")}_${x.year}.pdf`,
  };
});

export const removeByKey = z.function(z.tuple([z.string()])).implement(async (key) => {
  const client = new S3Client({ region: "eu-central-1" });
  const command = new DeleteObjectCommand({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Key: key!,
  });
  const response = await client.send(command);
  if (!response) throw new Error("not found");
  return response.DeleteMarker;
});
