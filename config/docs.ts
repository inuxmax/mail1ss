import { DocsConfig } from "types";

export const docsConfig: DocsConfig = {
  mainNav: [],
  sidebarNav: [
    {
      title: "Open API",
      items: [
        {
          title: "Overview",
          href: "/docs/open-api",
          icon: "page",
        },
        {
          title: "Screenshot API",
          href: "/docs/open-api/screenshot",
          icon: "page",
        },
        {
          title: "Meta Scraping API",
          href: "/docs/open-api/meta-info",
          icon: "page",
        },
        {
          title: "Url to Markdown API",
          href: "/docs/open-api/markdown",
          icon: "page",
        },
        {
          title: "Url to Text API",
          href: "/docs/open-api/text",
          icon: "page",
        },
        {
          title: "Url to QR Code API",
          href: "/docs/open-api/qrcode",
          icon: "page",
        },
        {
          title: "Svg Icon API",
          href: "/docs/open-api/icon",
          icon: "page",
        },
      ],
    },
  ],
};
