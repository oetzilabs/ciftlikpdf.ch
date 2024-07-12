import { AstroSite, SolidStartSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";

export function AstroStack({ stack, app }: StackContext) {
  const dns = use(DNSStack);
  const { api } = use(ApiStack);
  const { DATABASE_URL, DATABASE_AUTH_TOKEN } = use(SecretsStack);
  const { bucket } = use(StorageStack);

  const publicSolidStartApp = new SolidStartSite(stack, `${app.name}-solid-start-app`, {
    bind: [bucket, api, DATABASE_URL, DATABASE_AUTH_TOKEN],
    path: "packages/v2",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
    },
    customDomain: {
      domainName: `v2.${dns.domain}`,
      hostedZone: dns.zone.zoneName,
    },
    runtime: "nodejs20.x",
    nodejs: {
      install: ["@libsql/linux-x64-gnu", "@libsql/client"],
    },
  });

  stack.addOutputs({
    SolidStartSiteUrl: publicSolidStartApp.customDomainUrl || "http://localhost:3001",
  });

  return {
    publicSolidStartApp: publicSolidStartApp,
  };
}
