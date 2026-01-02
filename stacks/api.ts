const worker = new sst.cloudflare.Worker("PdfWorker", {
  path: "packages/functions",
  url: true,
});
