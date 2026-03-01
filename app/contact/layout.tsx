import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us – Get a Free Interior Design Consultation",
    description:
        "Get in touch with Arambha Design & Interior Studio for a free consultation. Visit our studio in Rajajinagar, Bangalore or reach us via phone, email, or WhatsApp. Mon-Sat 10AM-7PM.",
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
        url: "https://arambhainteriors.com/contact",
        type: "website",
    },
    alternates: {
        canonical: "https://arambhainteriors.com/contact",
    },
};

// JSON-LD for Contact Page
const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Arambha Design & Interior Studio",
    description: "Get in touch for a free interior design consultation in Bangalore.",
    url: "https://arambhainteriors.com/contact",
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
