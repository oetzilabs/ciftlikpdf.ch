import { Context } from "aws-lambda";
import aws from "aws-sdk";
import { createReport } from "docx-templates";
import util from "util";
import fs from "fs";
import { convertTo } from "@shelf/aws-lambda-libreoffice";
import { z } from "zod";

const fillDataIntoDocx = async (docxContent: Buffer, replacementDict: Record<string, any>) => {
  const buffer = await createReport({
    template: docxContent,
    data: replacementDict,
    processLineBreaks: true,
    processLineBreaksAsNewText: true,
  });

  return Buffer.from(buffer);
};

const createPdf = async (docxBuffer: Buffer) => {
  // write the buffer to a tmp file
  const randomString = Math.random().toString(36).substring(2, 15);
  const tmpFileName = `/tmp/${randomString}.docx`;
  await util.promisify(fs.writeFile)(tmpFileName, docxBuffer);
  const filename = `${randomString}.docx`;
  const s = await convertTo(filename, "pdf");
  const pdfBuffer = await util.promisify(fs.readFile)(s);
  return pdfBuffer;
};

export const handler = async (
  event: {
    body: string;
    requestContext: {
      http: {
        method: string;
      };
    };
  },
  context: Context
) => {
  if (event.requestContext.http.method !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }
  const data = JSON.parse(event.body || "{}");
  if (!data) {
    throw new Error("No data provided");
  }

  const validation = z
    .object({
      templateFile: z.array(z.number()), // this is a buffer
      user: z.string(),
      addres: z.string(),
      amount: z.number(),
      currency: z.string(),
      year: z.number(),
      date: z.string(),
    })
    .safeParse(data);

  if (!validation.success) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Bad request" }),
    };
  }
  const tf = validation.data.templateFile;
  if (!tf) {
    throw new Error("No template file provided");
  }
  const docxContent = await Buffer.from(tf);
  if (!docxContent) {
    throw new Error("Template not found");
  }

  const newDocx = await fillDataIntoDocx(docxContent, data);
  const pdf = await createPdf(newDocx);

  return {
    statusCode: 200,
    body: pdf.toString("base64"),
    isBase64Encoded: true,
  };
};
