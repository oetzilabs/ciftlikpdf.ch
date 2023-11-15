import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";
import { DashboardSolidStartStack } from "./stacks/DashboardSolidStartStack";
import { DNSStack } from "./stacks/DNSStack";
import { SolidStartStack } from "./stacks/PublicSolidStartStack";
import { DocXToPDFStackV2 } from "./stacks/DocXToPDFStackV2";

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
      .stack(StorageStack)
      .stack(DocXToPDFStackV2)
      .stack(ApiStack)
      .stack(DashboardSolidStartStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
