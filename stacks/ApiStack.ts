import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { DNSStack } from "./DNSStack";
import { SecretsStack } from "./SecretsStack";

export function ApiStack({ stack }: StackContext) {
  const dns = use(DNSStack);
  const secrets = use(SecretsStack);

  const { bucket } = use(StorageStack);

  const api = new Api(stack, "api", {
    customDomain: {
      domainName: "api." + dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    defaults: {
      function: {
        nodejs: {
          install: ["@libsql/linux-x64-gnu", "@libsql/client", "bcrypt", "jsonwebtoken", "node-gyp"],
          // esbuild: { external: ["@libsql/linux-x64-gnu"] },
        },
        runtime: "nodejs20.x",
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
      "GET /sponsor/{id}/donations": {
        function: {
          handler: "packages/functions/src/sponsors.donations",
          description: "This is the sponsors donations function",
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
