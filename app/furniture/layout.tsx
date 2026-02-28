import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Furniture Collection – Handcrafted & Custom Furniture",
    description:
        "Discover Arambha's handcrafted furniture collection – sofas, dining tables, beds, office furniture & bespoke custom designs. Premium quality crafted in Bangalore with 35+ years of expertise.",
    keywords: [
        "custom furniture Bangalore",
        "handcrafted furniture",
        "sofa design Bangalore",
        "dining table design",
        "bedroom furniture",
        "office furniture Bangalore",
        "bespoke furniture design",
        "furniture manufacturer Bangalore",
        "Arambha furniture",
    ],
    openGraph: {
        title: "Furniture Collection | Arambha Design & Interior Studio",
        description:
            "Handcrafted furniture that blends form, function, and timeless aesthetics. Custom designs available.",
        url: "https://arambhainteriors.com/furniture",
        type: "website",
    },
    alternates: {
        canonical: "https://arambhainteriors.com/furniture",
    },
};

export default function FurnitureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
