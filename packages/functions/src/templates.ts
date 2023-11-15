import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Template } from "@ciftlikpdf/core/entities/templates";
import { StatusCodes } from "http-status-codes";
import { ApiHandler, useFormData, usePathParam, useQueryParam } from "sst/node/api";
import { Bucket } from "sst/node/bucket";
import { error, getUser, json } from "./utils";

export const all = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const filter = useQueryParam("filter");
  if (filter === "non-deleted") {
    const templates = await Template.allWithoutDeleted().catch((e) => []);
    return json(templates);
  }

  const templates = await Template.all().catch((e) => []);

  return json(templates);
});

export const presignedUrl = ApiHandler(async () => {
  // this is for uploading templates in the frontend, I need to give the frontend a presigned url to upload the template

  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const templateName = body.get("templateName");
  if (!templateName) {
    return error("No templateName");
  }
  const client = new S3Client({
    region: "eu-central-1",
  });

  // get the presigned url for the template upload

  const command = new PutObjectCommand({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Key: `templates/${templateName}`,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: 60 * 60, // 1 hour
  });

  return json({ url });
});

export const syncOld = ApiHandler(async () => {
  // sync the files from the bucket to the database
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const client = new S3Client({
    region: "eu-central-1",
  });

  const command = new ListObjectsV2Command({
    Bucket: Bucket["ciftlikpdf-bucket"].bucketName,
    Prefix: "templates/",
  });

  const files = await client.send(command);
  const contents = files.Contents;
  if (!contents) {
    return json([]);
  }

  const templates = contents.map((x) => ({ Key: x.Key })).filter((x) => typeof x !== "undefined") as { Key: string }[];

  const transfered: Awaited<ReturnType<typeof Template.all>> = [];

  // check if the template exists in the database, if not, create it
  for (const template of templates) {
    const ts = await Template.findByName(template.Key);
    if (!ts) {
      const t = await Template.create({
        Key: template.Key,
        default: false,
      });
      transfered.push(t);
    } else {
      transfered.push(ts);
    }
  }

  return json(transfered);
});

export const setAsDefault = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const x = await Template.setAsDefault(id);

  return json(x);
});

export const remove = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const x = await Template.remove(id);

  return json(x);
});

export const getDefault = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }

  const x = await Template.getDefault();
  if (!x) {
    return error("No default template", StatusCodes.NOT_FOUND);
  }

  return json(x);
});
