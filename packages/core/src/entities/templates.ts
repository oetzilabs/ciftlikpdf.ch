import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { sponsors_donations, templates } from "../drizzle/sql/schema";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Bucket } from "sst/node/bucket";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dayjs from "dayjs";

export * as Template from "./templates";

export const create = z.function(z.tuple([createInsertSchema(templates)])).implement(async (input) => {
  const [x] = await db.insert(templates).values(input).returning();
  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${templates.id})`,
    })
    .from(templates);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.templates.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.templates.findFirst({
    where: (fields, operations) => operations.eq(fields.Key, input),
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.templates.findMany();
});

export const allWithoutDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.templates.findMany({
    where(fields, operators) {
      return operators.isNull(fields.deletedAt);
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(templates)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    await db
      .update(templates)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(templates.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const isCreateValid = createInsertSchema(templates).safeParseAsync;

export const isUpdateValid = createInsertSchema(templates)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({ id: z.string() }).safeParseAsync;

export const createUploadUrlForTemplateFiles = z.function(z.tuple([z.string()])).implement(async (templateName) => {
  const client = new S3Client({
    region: "eu-central-1",
  });

  const command = new PutObjectCommand({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Key: `templates/${templateName}.dotx`,
    Expires: dayjs().add(1, "hour").toDate(),
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: 60 * 60 * 24 * 7,
  });

  return url;
});

export const setAsDefault = z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
  const [x] = await db.transaction(async (trx) => {
    await trx.update(templates).set({ default: false, updatedAt: new Date() }).returning();
    let y = await trx.update(templates).set({ default: true }).where(eq(templates.id, id)).returning();
    return y;
  });
  return x;
});

export const remove = z.function(z.tuple([z.string().uuid()])).implement(async (id) => {
  const [x] = await db
    .update(templates)
    .set({
      updatedAt: new Date(),
      deletedAt: new Date(),
      default: false,
    })
    .where(eq(templates.id, id))
    .returning();

  return x;
});

export const getDefault = z.function(z.tuple([])).implement(async () => {
  return db.query.templates.findFirst({
    where: (fields, operations) => operations.eq(fields.default, true),
  });
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
