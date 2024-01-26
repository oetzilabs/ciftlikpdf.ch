import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { DocXToPDFStackV2 } from "./DocXToPDFStackV2";

export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);
  const { DOCX_TO_PDF_URL } = use(DocXToPDFStackV2);
  const secrets = Config.Secret.create(stack, "DATABASE_URL", "DATABASE_AUTH_TOKEN", "JWT_SECRET");

  const { bucket } = use(StorageStack);

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        nodejs: {
          install: ["@libsql/linux-x64-gnu", "@libsql/client", "bcrypt", "jsonwebtoken", "node-gyp", "pandoc"],
          // esbuild: { external: ["@libsql/linux-x64-gnu"] },
        },
        // handler: "packages/functions/src/migrator.handler",
        bind: [secrets.DATABASE_URL, secrets.DATABASE_AUTH_TOKEN, secrets.JWT_SECRET, bucket],
        copyFiles: [
          {
            from: "packages/core/src/drizzle",
            to: "drizzle",
          },
        ],
      },
    },
    routes: {
      "POST /migration": {
        function: {
          handler: "packages/functions/src/migrator.handler",
          description: "This is the migrator function",
        },
      },
      "GET /healthcheck": {
        function: {
          handler: "packages/functions/src/healthcheck.main",
          description: "This is the healthcheck function",
        },
      },
      "POST /auth": {
        function: {
          handler: "packages/functions/src/auth.handler",
          description: "This is the auth function",
        },
      },
      "POST /register": {
        function: {
          handler: "packages/functions/src/auth.register",
          description: "This is the register function",
        },
      },
      "GET /session": {
        function: {
          handler: "packages/functions/src/auth.session",
          description: "This is the auth session function",
        },
      },
      "GET /sponsors/{id}": {
        function: {
          handler: "packages/functions/src/sponsors.get",
          description: "This is the sponsors get function",
        },
      },
      "DELETE /sponsors/{id}": {
        function: {
          handler: "packages/functions/src/sponsors.remove",
          description: "This is the sponsors remove function",
        },
      },
      "PUT /sponsors/{id}/update": {
        function: {
          handler: "packages/functions/src/sponsors.update",
          description: "This is the sponsors update function",
        },
      },
      "POST /sponsors": {
        function: {
          handler: "packages/functions/src/sponsors.create",
          description: "This is the sponsors create function",
        },
      },
      "POST /sponsor/{id}/donate": {
        function: {
          handler: "packages/functions/src/sponsors.donate",
          description: "This is the sponsors donate function",
        },
      },
      "PUT /sponsor/{id}/donate/{did}": {
        function: {
          handler: "packages/functions/src/sponsors.updateDonation",
          description: "This is the sponsors updateDonation function",
        },
      },
      "DELETE /sponsor/{id}/donate/{did}": {
        function: {
          handler: "packages/functions/src/sponsors.removeDonation",
          description: "This is the sponsors removeDonation function",
        },
      },
      "POST /sponsor/{id}/pdf/{did}": {
        function: {
          handler: "packages/functions/src/sponsors.donationPdf",
          description: "This is the sponsors donationPdf function",
          environment: {
            DOCX_TO_PDF_URL: DOCX_TO_PDF_URL!,
          },
        },
      },
      "GET /sponsors/all": {
        function: {
          handler: "packages/functions/src/sponsors.all",
          description: "This is the sponsors all function",
        },
      },
      "GET /sponsors/count": {
        function: {
          handler: "packages/functions/src/sponsors.count",
          description: "This is the sponsors count function",
        },
      },
      "GET /templates/all": {
        function: {
          handler: "packages/functions/src/templates.all",
          description: "This is the templates all function",
        },
      },
      "GET /templates/default": {
        function: {
          handler: "packages/functions/src/templates.getDefault",
          description: "This is the templates getDefault function",
        },
      },
      "POST /templates/sync-old": {
        function: {
          handler: "packages/functions/src/templates.syncOld",
          description: "This is the templates syncOld function",
        },
      },
      "POST /templates/presigned-url": {
        function: {
          handler: "packages/functions/src/templates.presignedUrl",
          description: "This is the templates presignedUrl function",
        },
      },
      "DELETE /templates/{id}": {
        function: {
          handler: "packages/functions/src/templates.remove",
          description: "This is the templates remove function",
        },
      },
      "POST /templates/{id}/set-default": {
        function: {
          handler: "packages/functions/src/templates.setAsDefault",
          description: "This is the templates setAsDefault function",
        },
      },
      "GET /pdfs/all": {
        function: {
          handler: "packages/functions/src/pdfs.all",
          description: "This is the pdfs all function",
        },
      },
      "POST /pdfs/download-url": {
        function: {
          handler: "packages/functions/src/pdfs.downloadUrl",
          description: "This is the pdfs downloadUrl function",
        },
      },
      "POST /pdfs/public/download-url/{did}": {
        function: {
          handler: "packages/functions/src/pdfs.publicDownloadUrl",
          description: "This is the pdfs publicDownloadUrl function",
        },
      },
      "DELETE /pdfs/{id}": {
        function: {
          handler: "packages/functions/src/pdfs.remove",
          description: "This is the pdfs remove function",
        },
      },
      "DELETE /pdfs/by-key": {
        function: {
          handler: "packages/functions/src/pdfs.removeByKey",
          description: "This is the pdfs removeByKey function",
        },
      },
      "GET /superadmin/users/all": {
        function: {
          handler: "packages/functions/src/superadmin.allUsers",
          description: "This is the superadmin allUsers function",
        },
      },
      "PUT /superadmin/user/update": {
        function: {
          handler: "packages/functions/src/superadmin.updateUser",
          description: "This is the superadmin updateUser function",
        },
      },
      "PUT /superadmin/user/{id}/make-admin": {
        function: {
          handler: "packages/functions/src/superadmin.makeAdmin",
          description: "This is the superadmin makeAdmin function",
        },
      },
      "PUT /superadmin/user/{id}/make-viewer": {
        function: {
          handler: "packages/functions/src/superadmin.makeViewer",
          description: "This is the superadmin makeViewer function",
        },
      },
      "PUT /superadmin/user/{id}/make-superadmin": {
        function: {
          handler: "packages/functions/src/superadmin.makeSuperadmin",
          description: "This is the superadmin makeSuperadmin function",
        },
      },
      "GET /search/pdf": {
        function: {
          handler: "packages/functions/src/searchs.pdfs",
          description: "This is the search pdfs function",
        },
      },
    },
    cors: {
      allowOrigins: ["*", "http://localhost:3000", "http://localhost:3001"],
    },
  });

  new Config.Parameter(stack, "APP_URL", {
    value: api.url,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
  });

  return {
    api,
    DATABASE_URL: secrets.DATABASE_URL,
    DATABASE_AUTH_TOKEN: secrets.DATABASE_AUTH_TOKEN,
  };
}
