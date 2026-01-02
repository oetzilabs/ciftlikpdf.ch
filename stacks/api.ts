const worker = new sst.cloudflare.Worker("PdfWorker", {
  hander: "packages/functions/src/pdf-generate.main",
  url: true,
});

const migrator = new sst.cloudflare.Worker("MigratorWorker", {
  hander: "packages/functions/src/migrator.handler",
  url: true,
});
