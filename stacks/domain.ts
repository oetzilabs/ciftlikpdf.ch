export const domain = (() => {
  if ($app.stage === "main") return "ciftlikpdf.ch";
  if ($app.stage === "dev") return "dev.ciftlikpdf.ch";
  return `${$app.stage}.dev.ciftlikpdf.ch`;
})();

export const zoneID = "bae2152a70fa64165c1572a50e1fa8f8";
