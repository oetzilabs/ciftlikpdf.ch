import { Function, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";

export function DocXToPDFStackV2({ stack, app }: StackContext) {
  const { bucket } = use(StorageStack);
  const dns = use(DNSStack);

  const docxtopdfv2 = new Function(stack, "docxtopdf-v2", {
    handler: "docxtopdf",
    environment: {
      AWS_BUCKET_REGION: app.region,
      AWS_BUCKET_NAME: bucket.bucketName,
      AWS_BUCKET_ARN: bucket.bucketArn,
    },
    runtime: "container",
    container: {
      cmd: ["docxpdf.handler"],
    },
    bind: [bucket],
    url: {
      authorizer: "none",
      cors: {
        allowHeaders: ["*"],
        allowMethods: ["POST"],
        allowOrigins: ["*"],
        allowCredentials: false,
      },
    },
    timeout: 30,
    description: "Converts a docx file to pdf",
  });

  docxtopdfv2.attachPermissions([bucket]);

  stack.addOutputs({
    DOCX_TO_PDF_URL: docxtopdfv2.url,
  });

  return {
    DOCX_TO_PDF_URL: docxtopdfv2.url,
  };
}
