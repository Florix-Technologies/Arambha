import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: "Furniture Collection – Handcrafted & Custom Furniture",
    description:
        "Discover Arambha's handcrafted sofas, dining tables, beds, office furniture and custom designs, made in Bangalore with 35+ years of expertise.",
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
        url: `${SITE_URL}/furniture`,
        type: "website",
        images: [{
            url: "/logo1.png",
            width: 1200,
            height: 630,
            alt: "Arambha Design & Interior Studio - Premium Interior Design",
        }],
    },
    alternates: {
        canonical: `${SITE_URL}/furniture`,
    },
};

export default function FurnitureLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
