import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";
import { DNSStack } from "./stacks/DNSStack";
import { AstroStack } from "./stacks/AstroStack";
import { SecretsStack } from "./stacks/SecretsStack";

export default {
  config(_input) {
    return {
      name: "ciftlikpdf",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.setDefaultRemovalPolicy("destroy");
    app
      //
      .stack(DNSStack)
      .stack(SecretsStack)
      .stack(StorageStack)
      .stack(ApiStack)
      .stack(AstroStack);
  },
} satisfies SSTConfig;
