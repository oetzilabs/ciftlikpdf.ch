import { AstroSite, SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
// import { DatabaseStack } from "./DatabaseStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { DocXToPDFStackV2 } from "./DocXToPDFStackV2";
import { Secret } from "sst/constructs/Secret";
import { SecretsStack } from "./SecretsStack";

export function AstroStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api } = use(ApiStack);
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = use(SecretsStack);
  // const { db } = use(DatabaseStack);
  const { bucket } = use(StorageStack);

  const publicAstroApp = new AstroSite(stack, `${app.name}-astro-app`, {
    bind: [bucket, api, DATABASE_URL, DATABASE_AUTH_TOKEN],
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
