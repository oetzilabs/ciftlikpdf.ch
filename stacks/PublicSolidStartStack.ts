import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { DocXToPDFStackV2 } from "./DocXToPDFStackV2";

export function SolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);
  const { DOCX_TO_PDF_URL } = use(DocXToPDFStackV2);

  const publicSolidStartApp = new SolidStartSite(stack, `${app.name}-app`, {
    bind: [bucket, api],
    path: "packages/app",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
    },
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: publicSolidStartApp.customDomainUrl || "http://localhost:3000",
  });

  return {
    publicSolidStartApp: publicSolidStartApp,
  };
}
