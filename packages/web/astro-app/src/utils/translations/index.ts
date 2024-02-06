export interface LanguageOption {
  value: "tr" | "fr" | "de";
  label: string;
  disabled?: boolean;
}
export const languages: LanguageOption[] = [
  { value: "tr", label: "Türkçe" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
];

export const translations = {
  yourDonoOurThank: {
    de: "Ihre Spende - unser Dank!",
    fr: "Votre don - notre remerciement!",
    tr: "Bagisiniz - tesekkurumuz!",
  },
  greetings: {
    de: (name: string) => `Sehr geehrte/r ${name},`,
    fr: (name: string) => `Cher ${name},`,
    tr: (name: string) => `Sayin ${name},`,
  },
  main: {
    de: `Sie haben unserer Stiftung in diesem Jahr eine Spende zukommen lassen - dafür möchten wir Ihnen herzlichst danken. Durch Ihre Unterstützung konnten wir in unserem Dorf "Ciftlik-Köyü" viele wertvolle Hilfe leisten und die Struktur unserer Stiftung stärken. Dank Ihnen und vielen weiteren Spendenden konnten wir zum Beispiel den Schulhof im Dorfkern errichten, mehreren ärmeren Familien einen Schulbesuch der Kinder ermöglichen und einen Aufseher für unser Dorf engagieren.`,
    fr: `Vous avez fait un don à notre fondation cette année - nous vous en remercions chaleureusement. Grâce à votre soutien, nous avons pu apporter une aide précieuse à notre village "Ciftlik-Köyü" et renforcer la structure de notre fondation. Grâce à vous et à de nombreux autres donateurs, nous avons pu construire la cour de récréation au centre du village, permettre à plusieurs familles pauvres de scolariser leurs enfants et engager un surveillant pour notre village.`,
    tr: `Bu yil vakfimiza bagis yaptiginiz icin tesekkur ederiz. Desteginizle Ciftlik Köyü'nde bir cok faydali yardimlarda bulunduk ve vakfimizin yapisi guclendirdik. Sizin ve bircok bagiscinin yardimiyla, ornegin koy merkezindeki okul bahcesini insa ettik, bir cok fakir ailenin cocuklarinin okula gitmesini sagladik ve koyumuz icin bir bekci tuttuk.`,
  },
  receival: {
    de: (value: string, currency: string, year: number) =>
      `Gerne bestätigen wir hiermit Ihre Spende für das Jahr <strong>${year}</strong> von Total: <strong>${value} ${currency}</strong>.`,
    fr: (value: string, currency: string, year: number) =>
      `Nous confirmons par la présente votre don pour l'année <strong>${year}</strong> de Total: <strong>${value} ${currency}</strong>.`,
    tr: (value: string, currency: string, year: number) =>
      `<strong>${year}</strong> yili icin yaptiginiz toplam <strong>${value} ${currency}</strong> bagisinizi bu vesileyle onayliyoruz.`,
  },
  thanks: {
    de: `Im Namen unseres Dorfes und unserer Stiftung bedanken wir uns herzlichst für Ihre Spende und
    freuen uns weiterhin auf Ihre wertvolle Unterstützung.`,
    fr: `Au nom de notre village et de notre fondation, nous vous remercions chaleureusement pour votre don et nous réjouissons de votre précieux soutien.`,
    tr: `Koyumuz ve vakfimiz adina bagisiniz icin tesekkur eder, degerli desteginizi bekleriz.`,
  },
  goodbye: {
    de: `Mit freundlichen Grüssen`,
    fr: `Avec nos meilleures salutations`,
    tr: `Saygilarimizla`,
  },
} as const;
