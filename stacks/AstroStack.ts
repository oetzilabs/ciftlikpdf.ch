import { AstroSite, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
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
    runtime: "nodejs20.x",
    nodejs: {
      format: "esm",
      install: ["@libsql/linux-x64-gnu", "@libsql/client", "bcrypt", "jsonwebtoken", "node-gyp"],
      esbuild: {
        format: "esm",
        platform: "node",
        target: ["es2022", "node20"],
        supported: { "top-level-await": true },
      },
    },
  });

  stack.addOutputs({
    SiteUrl: publicAstroApp.customDomainUrl || "http://localhost:4321",
  });

  return {
    publicSolidStartApp: publicAstroApp,
  };
}
