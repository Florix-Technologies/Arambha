import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: "Interior Solutions – Bespoke Craft for Modern Living",
    description:
        "Explore Arambha's modular, wooden and aluminum interiors, with end-to-end design and execution for homes and commercial spaces in Bangalore.",
    keywords: [
        "interior solutions Bangalore",
        "modular interiors",
        "wooden interiors",
        "aluminum interiors",
        "bespoke interiors Bangalore",
        "residential interiors",
        "commercial interiors Bangalore",
        "Arambha interior solutions",
        "complete home interiors",
    ],
    openGraph: {
        title: "Interior Solutions | Arambha Design & Interior Studio",
        description:
            "Bespoke craft for modern living. Complete interior solutions for residential and commercial spaces in Bangalore.",
        url: `${SITE_URL}/interiors`,
        type: "website",
        images: [{
            url: "/logo1.png",
            width: 1200,
            height: 630,
            alt: "Arambha Design & Interior Studio - Premium Interior Design",
        }],
    },
    alternates: {
        canonical: `${SITE_URL}/interiors`,
    },
};

export default function InteriorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
