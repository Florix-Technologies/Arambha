import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Interior Solutions – Bespoke Craft for Modern Living",
    description:
        "Explore Arambha's complete interior solutions – modular, wooden & aluminum interiors. End-to-end design and execution for residential and commercial spaces in Bangalore.",
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
        url: "https://arambhainteriors.com/interiors",
        type: "website",
    },
    alternates: {
        canonical: "https://arambhainteriors.com/interiors",
    },
};

export default function InteriorsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
