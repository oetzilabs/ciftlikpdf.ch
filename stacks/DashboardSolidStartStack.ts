import { SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { DocXToPDFStackV2 } from "./DocXToPDFStackV2";

export function DashboardSolidStartStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api, DATABASE_AUTH_TOKEN, DATABASE_URL } = use(ApiStack);
  const { DOCX_TO_PDF_URL } = use(DocXToPDFStackV2);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);
  const apiUrl = api.customDomainUrl || api.url;
  const dashboardSolidStartApp = new SolidStartSite(stack, `${app.name}-dashboard-app`, {
    bind: [bucket, api, DATABASE_AUTH_TOKEN, DATABASE_URL],
    path: "packages/dashboard",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: apiUrl,
      VITE_AUTH_URL: apiUrl + "/auth",
    },
    customDomain: {
      domainName: "dashboard." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
  });

  stack.addOutputs({
    SiteUrl: dashboardSolidStartApp.customDomainUrl || "http://localhost:3001",
  });

  return {
    solidStartApp: dashboardSolidStartApp,
  };
}
