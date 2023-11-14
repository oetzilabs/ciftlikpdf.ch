import { Context } from "aws-lambda";
import aws from "aws-sdk";
import { createReport } from "docx-templates";
import util from "util";
import fs from "fs";
import { convertTo } from '@shelf/aws-lambda-libreoffice';


const s3Client = new aws.S3({
  region: process.env.AWS_BUCKET_REGION,
});

const downloadFromS3 = async (templateFile: string) => {
  const bucketName = process.env.AWS_BUCKET_NAME || "";
  const key = `templates/${templateFile}`;

  const response = await s3Client.getObject({ Bucket: bucketName, Key: key }).promise();
  const b = response.Body;
  if (!b) {
    throw new Error("No body in response");
  }
  return Buffer.from(b as any);
};

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

const uploadToS3 = async (pdfBuffer: Buffer, sponsorId: string, donationId: string) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const s3Key = `sponsor-pdf/${sponsorId}/${donationId}.pdf`;

  try {
    await s3Client.putObject({ Bucket: bucketName!, Key: s3Key, Body: pdfBuffer }).promise();
    return s3Key;
  } catch (error) {
    console.error(error);
    throw error;
  }
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
  if (process.env.IS_LOCAL) {
    return {
      statusCode: 403,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    };
  }
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
    throw new Error("No body provided");
  }
  if (!data) {
    throw new Error("No data provided");
  }

  const sponsorId = data.sid;
  const donationId = data.did;

  console.log("sponsorId", sponsorId);
  console.log("donationId", donationId);

  if (!sponsorId || !donationId) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Missing sponsorId or donationId" }),
    };
  }

  const s3Key = `sponsor-pdf/${sponsorId}/${donationId}.pdf`;

  try {
    await s3Client.headObject({ Bucket: process.env.AWS_BUCKET_NAME!, Key: s3Key }).promise();
    const signedUrl = await s3Client.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Expires: 60 * 60, // URL expiration time in seconds
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pdfUrl: signedUrl }),
    };
  } catch (error) {
    console.error(error);
  }
  const tf = data.templateFile;
  if (!tf) {
    throw new Error("No template file provided");
  }
  const docxContent = await downloadFromS3(tf);
  if (!docxContent) {
    throw new Error("Template not found");
  }
  const newDocx = await fillDataIntoDocx(docxContent, data);

  const pdf = await createPdf(newDocx);

  const key = await uploadToS3(pdf, sponsorId, donationId);

  const downloadUrl = await s3Client.getSignedUrlPromise("getObject", {
    Bucket: process.env.AWS_BUCKET_NAME || "",
    Key: key,
    Expires: 60 * 60, // URL expiration time in seconds
  });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pdfUrl: downloadUrl }),
  };
  // return {
  //   statusCode: 200,
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(body),
  // };
};
