import { AstroSite, SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { DocXToPDFStackV2 } from "./DocXToPDFStackV2";

export function AstroStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api, DATABASE_URL, DATABASE_AUTH_TOKEN } = use(ApiStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);
  const { DOCX_TO_PDF_URL } = use(DocXToPDFStackV2);

  const publicAstroApp = new AstroSite(stack, `${app.name}-astro-app`, {
    bind: [bucket, api],
    path: "packages/web/astro-app",
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
    SiteUrl: publicAstroApp.customDomainUrl || "http://localhost:4321",
  });

  return {
    publicSolidStartApp: publicAstroApp,
  };
}
