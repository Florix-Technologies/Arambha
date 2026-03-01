import type { Metadata } from "next";
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

const BASE_URL = "https://arambhainteriors.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Arambha Design & Interior Studio | Premium Interior Design in Bangalore",
    template: "%s | Arambha Design & Interior Studio",
  },
  description:
    "Transform your home with Arambha – Bangalore's premier interior design studio with 35+ years of expertise. Modular kitchens, wardrobes, living rooms, furniture & complete home interiors. 2000+ projects delivered.",
  keywords: [
    "interior design Bangalore",
    "home interiors Bangalore",
    "modular kitchen Bangalore",
    "wardrobe design",
    "living room interiors",
    "furniture Bangalore",
    "interior designer near me",
    "home renovation Bangalore",
    "modular interiors",
    "kitchen design",
    "false ceiling",
    "pooja room design",
    "TV unit design",
    "crockery unit",
    "office furniture Bangalore",
    "Arambha interiors",
    "premium interior design",
    "residential interior design",
    "commercial interior design",
  ],
  authors: [{ name: "Arambha Design & Interior Studio" }],
  creator: "Arambha Design & Interior Studio",
  publisher: "Arambha Design & Interior Studio",
  icons: {
    icon: "/logo2.png",
    apple: "/logo2.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Arambha Design & Interior Studio",
    title: "Arambha Design & Interior Studio | Premium Interior Design in Bangalore",
    description:
      "Transform your home with Arambha – Bangalore's premier interior design studio. Modular kitchens, wardrobes, living rooms, furniture & complete home interiors. 35+ years, 2000+ projects.",
    images: [
      {
        url: "/logo1.png",
        width: 1200,
        height: 630,
        alt: "Arambha Design & Interior Studio - Premium Interior Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arambha Design & Interior Studio | Premium Interior Design in Bangalore",
    description:
      "Transform your home with Arambha – Bangalore's premier interior design studio. Modular kitchens, wardrobes, living rooms & complete home interiors.",
    images: ["/logo1.png"],
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
  alternates: {
    canonical: BASE_URL,
  },
  category: "Interior Design",
};

// JSON-LD Structured Data for Local Business
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE_URL}/#business`,
  name: "Arambha Design & Interior Studio",
  image: `${BASE_URL}/logo1.png`,
  description:
    "Premium Interior Design, Furniture & Architectural Solutions in Bangalore with 35+ years of experience and 2000+ projects delivered.",
  url: BASE_URL,
  telephone: "+91-91876-28243",
  email: "hello@arambha.com",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "No.11/68/1, 2nd Floor, 59th Cross, 4th Block, Rajajinagar, Opp. MEI Polytechnic College",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    postalCode: "560010",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9716,
    longitude: 77.5946,
  },
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

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InquiryPopup from "@/components/layout/InquiryPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${cormorant.variable}`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <InquiryPopup />
      </body>
    </html>
  );
}
