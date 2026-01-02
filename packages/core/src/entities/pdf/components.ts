import {
  Alignment,
  Content,
  ContentColumns,
  ContentText,
  CustomTableLayout,
  Table as PdfMakeTable,
  TableCell,
  TableLayout,
} from "pdfmake/interfaces";

export const default_styles = {
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
  sectionHeader: {
    fontSize: 10,
    bold: true,
    font: "Helvetica",
  },
  normalText: {
    fontSize: 8,
    font: "Helvetica",
    lineHeight: 1.4,
  },
  smallText: {
    fontSize: 7,
    font: "Helvetica",
    lineHeight: 1.4,
  },
  tableHeader: {
    fontSize: 10,
    bold: true,
    font: "Helvetica",
    color: "#495057",
  },
  tableCell: {
    fontSize: 9,
    font: "Helvetica",
    color: "#212529",
  },
  smallHeaderLogo: {
    fontSize: 8,
    font: "Helvetica",
    alignment: "center",
  },
  smallHeaderTitle: {
    fontSize: 10,
    bold: true,
    font: "Helvetica",
  },
  smallHeaderText: {
    fontSize: 8,
    color: "grey",
    font: "Helvetica",
  },
  mono: {
    font: "Courier",
    fontSize: 8,
    color: "#212529",
    lineHeight: 1,
  },
} as const;

type Styles = keyof typeof default_styles;

export const Row = <T>(
  contents: T[],
  config: {
    border?: {
      tuple: [boolean, boolean, boolean, boolean];
      color: [string, string, string, string];
      style: "solid" | "dashed";
    };
  } = {
    border: {
      tuple: [true, false, true, true],
      color: ["#222222", "#222222", "#222222", "#222222"],
      style: "solid",
    },
  }
) => {
  return [
    {
      stack: [...contents].filter(Boolean),
      border: config.border?.tuple ?? [false, false, false, true],
      borderColor: config.border?.color,
    },
  ];
};

export const Text = (
  text: string,
  style: Styles = "normalText",
  config: {
    margin?: [number, number, number, number];
    lineHeight?: number;
    colSpan?: number;
    alignment?: Alignment | undefined;
  } = {
    margin: undefined,
    lineHeight: undefined,
    colSpan: undefined,
  }
) => {
  return {
    text,
    style,
    colSpan: config.colSpan,
    alignment: config.alignment,
    ...config,
  } satisfies ContentText["text"];
};
export type BorderConfig = {
  width?: number;
  color?: string;
  style?: "solid" | "dashed";
};

export const getTableLayout = (
  borderConfig: BorderConfig = {
    width: 0.5,
    color: "#222222",
  },
  tc: CustomTableLayout = {
    paddingLeft: (i, node) => 0,
    paddingRight: (i, node) => 0,
    paddingTop: (i, node) => 0,
    paddingBottom: (i, node) => 0,
    fillColor: "#222222",
    fillOpacity: 1,
    defaultBorder: true,
  }
): CustomTableLayout => ({
  hLineWidth: (i, node) => borderConfig.width ?? 0.5,
  vLineWidth: (i, node) => borderConfig.width ?? 0.5,
  hLineColor: (i, node) => borderConfig.color ?? "#222222",
  vLineColor: (i, node) => borderConfig.color ?? "#222222",
  hLineStyle: (i, node) => (borderConfig.style === "dashed" ? { dash: { length: 4 } } : null),
  vLineStyle: (i, node) => (borderConfig.style === "dashed" ? { dash: { length: 4 } } : null),
  defaultBorder: tc.defaultBorder ?? false,
  fillColor: tc.fillColor ?? "#000000",
  fillOpacity: tc.fillOpacity ?? ((i, node) => 0),
  paddingLeft: tc.paddingLeft ?? ((i, node) => 0),
  paddingRight: tc.paddingRight ?? ((i, node) => 0),
  paddingTop: tc.paddingTop ?? ((i, node) => 0),
  paddingBottom: tc.paddingBottom ?? ((i, node) => 0),
});

export const Table = (
  contents: (TableCell | null)[],
  config: {
    widths: PdfMakeTable["widths"];
    border?: BorderConfig;
    layout?: CustomTableLayout;
  } = {
    widths: ["*"],
    border: {
      color: "#222222",
    },
    layout: {
      paddingBottom: (i, node) => 10,
      paddingLeft: (i, node) => 10,
      paddingRight: (i, node) => 10,
      paddingTop: (i, node) => 10,
      defaultBorder: false,
    },
  }
) => {
  const rows = contents.filter(Boolean).map((cell) => (Array.isArray(cell) ? cell : [cell]));
  return {
    table: {
      widths: config.widths,
      body: rows,
    },
    layout: getTableLayout(
      config.border,
      config.layout ?? {
        paddingBottom: (i, node) => 10,
        paddingLeft: (i, node) => 10,
        paddingRight: (i, node) => 10,
        paddingTop: (i, node) => 10,
        defaultBorder: false,
      }
    ),
  };
};

export const Image = (
  data: string,
  size: number,
  config: {
    margin?: [number, number, number, number];
    alignment?: "center" | "left" | "right";
  } = {}
) => {
  const isDataUrl = data.startsWith("data:");
  const isHttpUrl = data.startsWith("http://") || data.startsWith("https://");

  return {
    image: isDataUrl ? data : isHttpUrl ? data : `data:image/png;base64,${data}`,
    width: size,
    fit: [size, size] as [number, number],
    ...config,
  };
};

export const Cell = (
  contents: Content[],
  config: {
    border?: [boolean, boolean, boolean, boolean];
    borderColor?: [string, string, string, string];
  } = {
    border: [true, true, true, true],
    borderColor: ["#222222", "#222222", "#222222", "#222222"],
  }
) => {
  return {
    columns: contents.filter(Boolean),
    ...config,
  } as TableCell;
};
