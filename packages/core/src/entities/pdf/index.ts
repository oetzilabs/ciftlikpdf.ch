import { Effect } from "effect";
import PdfPrinter from "pdfmake";
import { Content, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { default_styles, getTableLayout, Text } from "./components";
import { PDFGenerationError } from "./errors";

export type PaperSize = "A4" | "A5";
export type PaperOrientation = "portrait" | "landscape";
type HeaderVariant = "small" | "big";
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

const languageMap: Record<SupportedLanguage, string> = {
  tr: "Türkçe",
  de: "Deutsch",
  fr: "Français",
};

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
      "Au nom de notre village et de notre fondation, nous vous remercions chaleureusement pour votre don et nous réjouissons de votre précieux soutien.",
    goodbye: "Avec nos meilleures salutations",
  },
};

export class PDFService extends Effect.Service<PDFService>()("@warehouse/pdf", {
  effect: Effect.gen(function* () {
    const getPaperDimensions = (size: PaperSize, orientation: PaperOrientation): [number, number] => {
      const dimensions = {
        A4: [595, 842] as [number, number], // width, height in points
        A5: [420, 595] as [number, number],
      };
      const [width, height] = dimensions[size];
      return orientation === "portrait" ? [width, height] : [height, width];
    };

    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };

    type PageTableCell = TableCell & {
      border?: [boolean, boolean, boolean, boolean];
      borderColor?: string[];
    };

    const createDonationReceipt = (info: DonationInfo): Content[] => {
      const lang = info.language;
      const t = translations[lang] || translations.tr; // Default to Turkish

      const content: Content[] = [];

      // Organization header
      content.push({
        stack: upperTitle.map((title) => ({
          text: title,
          fontSize: 8,
          alignment: "center",
          margin: [0, 0, 0, 0],
        })),
        margin: [0, 0, 0, 10],
      });

      // Add logo (positioned on the right)
      content.push({
        image: info.address, // Using address field as logo data for now
        width: 50,
        alignment: "right",
        margin: [0, 0, 50, 50],
      });

      // Add spacing
      content.push({ text: "", margin: [0, 0, 0, 20] });

      // Donator name and address
      content.push({
        stack: [
          Text(info.name, "header", { margin: [0, 0, 0, 5] }),
          ...info.address
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => Text(line, "subheader", { lineHeight: 1.4 })),
        ],
        margin: [0, 0, 0, 20],
      });

      // Date on the right
      content.push({
        text: info.creationDate,
        alignment: "right",
        fontSize: 10,
        margin: [0, 0, 0, 10],
      });

      // Title
      content.push({
        text: t.yourDonoOurThank,
        bold: true,
        fontSize: 10,
        margin: [0, 0, 0, 10],
      });

      // Main content with greetings
      const greetingsText = t.greetings.replace("%s", info.name);
      const receivalText = t.receival
        .replace("%d", info.year.toString())
        .replace("%.2f", info.value.toFixed(2))
        .replace("%s", info.currency);

      // Parse and handle <strong> tags in receival text
      const parseReceivalText = (text: string): Content[] => {
        const parts = text.split("<strong>");
        const result: Content[] = [];

        if (parts[0]) {
          result.push({ text: parts[0], fontSize: 10 });
        }

        for (let i = 1; i < parts.length; i++) {
          const subParts = parts[i].split("</strong>", 2);
          if (subParts.length === 2) {
            result.push({ text: subParts[0], bold: true, fontSize: 10 });
            if (subParts[1]) {
              result.push({ text: subParts[1], fontSize: 10 });
            }
          } else {
            result.push({ text: parts[i], fontSize: 10 });
          }
        }

        return result;
      };

      content.push({
        stack: [
          { text: greetingsText, bold: true, fontSize: 10, margin: [0, 0, 0, 10] },
          { text: t.main, fontSize: 10, margin: [0, 0, 0, 10] },
          ...parseReceivalText(receivalText),
          { text: "", margin: [0, 0, 0, 10] },
          { text: t.thanks, fontSize: 10, margin: [0, 0, 0, 10] },
          { text: t.goodbye, fontSize: 10 },
        ],
        margin: [0, 0, 0, 20],
      });

      return content;
    };

    const base = Effect.fn("@warehouse/pdf/base")(function* (options: {
      image: string;
      paper: { size: PaperSize; orientation: PaperOrientation };
      header: {
        variant: "small" | "big";
        content: TableCell[];
        border?: {
          width: number;
        };
      };
      content: TableCell[];
      footer?: TableCell[];
      info: {
        title: string;
        author: string;
        subject: string;
        keywords: string;
      };
    }) {
      const dimensions = getPaperDimensions(options.paper.size, options.paper.orientation);
      const margins = 40;
      const result = {
        pageSize: { width: dimensions[0], height: dimensions[1] },
        pageOrientation: options.paper.orientation,
        pageMargins: [margins / 2, margins / 2, margins / 2, margins / 2],
        content: [
          {
            table: {
              widths: ["*"],
              heights: "auto",
              body: [[...options.header.content], ...options.content, ...(options.footer ? options.footer : [])],
            },
            layout: getTableLayout(
              { width: options.header.border?.width ?? 0.5 },
              { fillOpacity: (i: any, node: any) => 0 }
            ),
          },
        ],
        styles: default_styles,
        info: options.info,
      } as TDocumentDefinitions;
      return result;
    });

    const letter = Effect.fn("@warehouse/pdf/product")(function* (
      data: DonationInfo,
      config: {
        page: {
          size: "A4" | "A5";
          orientation: "portrait" | "landscape";
        };
      }
    ) {
      const donationContent = createDonationReceipt(data);

      const basePdf = {
        pageSize: { width: 595, height: 842 }, // A4
        pageOrientation: config.page.orientation,
        pageMargins: [50, 50, 50, 50],
        content: donationContent,
        styles: {
          header: {
            fontSize: 14,
            bold: true,
            font: "Helvetica",
          },
          subheader: {
            fontSize: 8,
            color: "#555555",
            font: "Helvetica",
          },
          normal: {
            fontSize: 10,
            font: "Helvetica",
          },
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
      } as TDocumentDefinitions;

      return yield* Effect.async<Buffer<ArrayBuffer>, PDFGenerationError>((resume: any) => {
        const pdfDoc = new PdfPrinter(fonts).createPdfKitDocument(basePdf);
        const chunks: Uint8Array[] = [];
        pdfDoc.on("data", (chunk: any) => chunks.push(chunk));
        pdfDoc.on("end", () => resume(Effect.succeed(Buffer.concat(chunks))));
        pdfDoc.on("error", (error: any) =>
          resume(Effect.fail(new PDFGenerationError({ cause: error, message: error.message })))
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
