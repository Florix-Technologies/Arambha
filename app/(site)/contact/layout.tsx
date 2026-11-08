import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: "Contact Us – Get a Free Interior Design Consultation",
    description:
        "Contact Arambha for a free interior consultation in Rajajinagar, Bangalore. Call, email or WhatsApp us, or visit Mon-Sat, 10AM-7PM.",
    keywords: [
        "interior design consultation Bangalore",
        "contact interior designer",
        "free interior consultation",
        "interior designer Rajajinagar",
        "Arambha contact",
        "home interior quote Bangalore",
    ],
    openGraph: {
        title: "Contact Us | Arambha Design & Interior Studio",
        description:
            "Get a free interior design consultation. Visit our studio in Rajajinagar, Bangalore or reach us via phone, email, or WhatsApp.",
        url: `${SITE_URL}/contact`,
        type: "website",
        images: [{
            url: "/logo1.png",
            width: 1200,
            height: 630,
            alt: "Arambha Design & Interior Studio - Premium Interior Design",
        }],
    },
    alternates: {
        canonical: `${SITE_URL}/contact`,
    },
};

// JSON-LD for Contact Page
const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Arambha Design & Interior Studio",
    description: "Get in touch for a free interior design consultation in Bangalore.",
    url: `${SITE_URL}/contact`,
    mainEntity: {
        "@type": "LocalBusiness",
        name: "Arambha Design & Interior Studio",
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
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
            />
            {children}
        </>
    );
}
