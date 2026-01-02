import { Effect } from "effect";
import PdfPrinter from "pdfmake";
import { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { default_styles, Text, Image } from "./components";
import { PDFGenerationError } from "./errors";
import { logo } from "./logo";

export type PaperSize = "A4" | "A5";
export type PaperOrientation = "portrait" | "landscape";
type SupportedLanguage = "tr" | "de" | "fr";

export interface DonationInfo {
  name: string;
  address: string;
  creationDate: string;
  language: SupportedLanguage;
  value: number;
  currency: string;
  year: number;
}

interface Translations {
  yourDonoOurThank: string;
  greetings: string;
  main: string;
  receival: string;
  thanks: string;
  goodbye: string;
}

const upperTitle = [
  "Ciftlik Köyü Sosyal Dayanisma Vakfi",
  "Stiftung für Unterstützung von Ciftlik Dorf",
  "Längistrasse 11 - 4133 Pratteln",
  "www.ciftlik.ch",
];

const translations: Record<SupportedLanguage, Translations> = {
  tr: {
    yourDonoOurThank: "Bagisiniz - tesekkürümüz!",
    greetings: "Sayin %s,",
    main: "Bu yil vakfimiza bagis yaptiginiz icin tesekkur ederiz. Desteginizle Ciftlik Köyü'nde bir cok faydali yardimlarda bulunduk ve vakfimizin yapisi guclendirdik. Sizin ve bircok bagiscinin yardimiyla, ornegin koy merkezindeki okul bahcesini insa ettik, bir cok fakir ailenin cocuklarinin okula gitmesini sagladik ve koyumuz icin bir bekci tuttuk.",
    receival:
      "<strong>%d</strong> yili icin yaptiginiz toplam <strong>%.2f %s</strong> bagisinizi bu vesileyle onayliyoruz.",
    thanks: "Koyumuz ve vakfimiz adina bagisiniz icin tesekkur eder, degerli desteginizi bekleriz.",
    goodbye: "Saygilarimizla",
  },
  de: {
    yourDonoOurThank: "Ihre Spende - unser Dank!",
    greetings: "Sehr geehrte/r %s,",
    main: 'Sie haben unserer Stiftung in diesem Jahr eine Spende zukommen lassen - dafür möchten wir Ihnen herzlichst danken. Durch Ihre Unterstützung konnten wir in unserem Dorf "Ciftlik-Köyü" viele wertvolle Hilfe leisten und die Struktur unserer Stiftung stärken. Dank Ihnen und vielen weiteren Spendenden konnten wir zum Beispiel den Schulhof im Dorfkern errichten, mehreren ärmeren Familien einen Schulbesuch der Kinder ermöglichen und einen Aufseher für unser Dorf engagieren.',
    receival:
      "Gerne bestätigen wir hiermit Ihre Spende für das Jahr <strong>%d</strong> von Total: <strong>%.2f %s</strong>.",
    thanks:
      "Im Namen unseres Dorfes und unserer Stiftung bedanken wir uns herzlichst für Ihre Spende und freuen uns weiterhin auf Ihre wertvolle Unterstützung.",
    goodbye: "Mit freundlichen Grüssen",
  },
  fr: {
    yourDonoOurThank: "Votre don - notre remerciement!",
    greetings: "Cher %s,",
    main: 'Vous avez fait un don à notre fondation cette année - nous vous en remercions chaleureusement. Grâce à votre soutien, nous avons pu apporter une aide précieuse à notre village "Ciftlik-Köyü" et renforcer la structure de notre fondation. Grâce à vous et à de nombreux autres donateurs, nous avons pu construire la cour de récréation au centre du village, permettre à plusieurs familles pauvres de scolariser leurs enfants et engager un surveillant pour notre village.',
    receival:
      "Nous confirmons par la présente votre don pour l'année <strong>%d</strong> de Total: <strong>%.2f %s</strong>.",
    thanks:
      "Au nom de notre village et de notre fondation, nous vous remercions chaleureusement pour votre don et nous nous réjouissons de votre précieux soutien.",
    goodbye: "Avec nos meilleures salutations",
  },
};

export class PDFService extends Effect.Service<PDFService>()("@ciftlikpdf/pdf", {
  effect: Effect.gen(function* () {
    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };

    const createDonationReceipt = (info: DonationInfo): Content[] => {
      const lang = info.language;
      const t = translations[lang] || translations.tr;

      const content: Content[] = [];

      // Organization header
      const headerTexts: Content[] = upperTitle.map((title) =>
        Text(title, "smallHeaderText", { alignment: "center" as const })
      );

      content.push({
        stack: [...headerTexts, Text("", "normalText"), Text("", "normalText")],
        margin: [0, 0, 0, 0],
        lineHeight: 1.4,
      });

      content.push(Image(`data:image/jpeg;base64,${logo}`, 100, { alignment: "right", margin: [0, -90, 0, 0] }));

      // Add spacing after logo
      content.push(Text("", "normalText"));
      content.push(Text("", "normalText"));

      // Donator name
      content.push(Text(info.name, "normalText", { margin: [0, 0, 0, 5] }));
      // Donator address
      const addressLines = info.address.split("\n");
      for (const line of addressLines) {
        if (line.trim()) {
          content.push(Text(line, "normalText"));
        }
      }

      // Add more spacing
      content.push(Text("", "normalText"));
      content.push(Text("", "normalText"));

      // Date on the right
      content.push(Text(info.creationDate, "normalText", { alignment: "right" as const, margin: [0, 0, 0, 10] }));

      // Title
      content.push(Text(t.yourDonoOurThank, "boldText", { margin: [0, 0, 0, 10] }));

      content.push(Text("", "normalText"));

      // Main content with greetings
      const greetingsText = t.greetings.replace("%s", info.name);
      const receivalText = t.receival
        .replace("%d", info.year.toString())
        .replace("%.2f", info.value.toFixed(2))
        .replace("%s", info.currency);

      // Parse and handle <strong> tags in receival text
      const parseReceivalText = (text: string): Content => {
        const parts = text.split("<strong>");
        const textArray: (string | { text: string; bold: boolean })[] = [];

        if (parts[0]) {
          textArray.push(parts[0]);
        }

        for (let i = 1; i < parts.length; i++) {
          const subParts = parts[i].split("</strong>", 2);
          if (subParts.length === 2) {
            textArray.push({ text: subParts[0], bold: true });
            if (subParts[1]) {
              textArray.push(subParts[1]);
            }
          } else {
            textArray.push(parts[i]);
          }
        }

        return {
          text: textArray,
          style: "normalText",
          alignment: "justify",
        };
      };

      // Main content stack
      content.push({
        stack: [
          Text(greetingsText, "normalText", { margin: [0, 0, 0, 10] }),
          Text(t.main, "normalText", { margin: [0, 0, 0, 10], alignment: "justify" }),
          parseReceivalText(receivalText),
          Text("", "normalText", { margin: [0, 0, 0, 10] }),
          Text(t.thanks, "normalText", { margin: [0, 0, 0, 10], alignment: "justify" }),
          Text(t.goodbye, "normalText"),
        ],
        margin: [0, 0, 0, 0],
      });

      return content;
    };

    const letter = Effect.fn("@warehouse/pdf/letter")(function* (
      data: DonationInfo,
      config: {
        page: {
          size: "A4" | "A5";
          orientation: "portrait" | "landscape";
        };
      }
    ) {
      return yield* Effect.async<Buffer<ArrayBuffer>, PDFGenerationError>((resume) => {
        const pdfDoc = new PdfPrinter(fonts).createPdfKitDocument({
          pageSize: { width: 595, height: 842 }, // A4
          pageOrientation: config.page.orientation,
          pageMargins: [50, 50, 50, 50],
          content: createDonationReceipt(data),
          styles: default_styles,
          defaultStyle: {
            font: "Helvetica",
          },
          info: {
            title: "Donation Letter",
            author: "ciftlikpdf.ch",
            subject: `Donation Letter for ${data.name}`,
            keywords: `donation,letter,${data.name}`,
          },
          footer: function (currentPage: number, pageCount: number) {
            return {
              text: `Page ${currentPage} of ${pageCount}`,
              alignment: "center",
              fontSize: 8,
              color: "#3F444C",
            };
          },
        });
        const chunks: Uint8Array[] = [];
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resume(Effect.succeed(Buffer.concat(chunks))));
        pdfDoc.on("error", (error) =>
          resume(Effect.fail(PDFGenerationError.make({ cause: error, message: error.message })))
        );
        pdfDoc.end();
      });
    });

    return {
      letter,
    } as const;
  }),
}) {}

export const PDFLive = PDFService.Default;
