import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';
import { BRAND, BUSINESS, pageMeta, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Contact Us – Book an Interior Design Consultation",
    description: "Contact Arambha Design & Interior Studio in Rajajinagar, Bangalore. Call, WhatsApp or visit us Mon–Sat, 10 AM–7 PM to book a design consultation.",
    path: "/contact",
});

// JSON-LD for Contact Page
const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${BRAND}`,
    url: `${SITE_URL}/contact`,
    mainEntity: {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#business`,
        name: BRAND,
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        address: { "@type": "PostalAddress", ...BUSINESS.address },
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
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(contactJsonLd) }}
            />
            {children}
        </>
    );
}
