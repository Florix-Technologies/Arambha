import type { Metadata } from "next";
import Script from "next/script";
import { SITE_URL } from '@/lib/site';
import { BRAND, BUSINESS, DEFAULT_OG_IMAGE, serializeJsonLd } from '@/lib/seo';
import { Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const DESCRIPTION =
  "Explore home interiors, modular kitchens, wardrobes and custom furniture by Arambha Design & Interior Studio in Rajajinagar, Bangalore. Request a design consultation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Interior Designers in Bangalore | Arambha Design & Interior Studio",
    template: "%s | Arambha Design & Interior Studio",
  },
  description: DESCRIPTION,
  authors: [{ name: BRAND }],
  creator: BRAND,
  publisher: BRAND,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BRAND,
    title: "Interior Designers in Bangalore | Arambha Design & Interior Studio",
    description: DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: BRAND }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interior Designers in Bangalore | Arambha Design & Interior Studio",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Interior Design",
};

// JSON-LD Structured Data for Local Business
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: BRAND,
  image: `${SITE_URL}/logo1.png`,
  logo: `${SITE_URL}/icon-512.png`,
  description:
    "Premium Interior Design, Furniture & Architectural Solutions in Bangalore with 35+ years of experience and 2000+ projects delivered.",
  url: SITE_URL,
  telephone: BUSINESS.phone,
  email: BUSINESS.email,
  address: { "@type": "PostalAddress", ...BUSINESS.address },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/arambha_interior_studio",
    "https://www.linkedin.com/in/mahesh-d-946a0a254/",
    "https://pin.it/4tBfqEBu0",
  ],
  priceRange: "₹₹₹",
  areaServed: {
    "@type": "City",
    name: "Bangalore",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Interior Design Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Modular House Interiors",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Kitchen Design",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Wardrobe Design",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Living Room Interiors",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Furniture",
        },
      },
    ],
  },
};

// Analytics only loads once the owner sets NEXT_PUBLIC_GA_ID.
const GA_ID = /^[A-Za-z0-9-]+$/.test(process.env.NEXT_PUBLIC_GA_ID ?? '') ? process.env.NEXT_PUBLIC_GA_ID : undefined;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
