export const domain = (() => {
  if ($app.stage === "main") return "ciftlikpdf.ch";
  if ($app.stage === "dev") return "dev.ciftlikpdf.ch";
  return `${$app.stage}.dev.ciftlikpdf.ch`;
})();

// export const zoneID = "6f659090c4a868d00656d51dbb55facf";
