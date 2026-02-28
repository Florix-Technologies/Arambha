import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Services – Modular Kitchens, Wardrobes, Living Rooms & More",
    description:
        "Explore Arambha's complete range of interior design services – modular kitchens, wardrobes, living room TV units, crockery units, false ceilings, lighting, pooja rooms, bathrooms, civil works, furniture & aluminum partitions in Bangalore.",
    keywords: [
        "modular kitchen design Bangalore",
        "wardrobe design Bangalore",
        "living room TV unit",
        "crockery unit design",
        "false ceiling design",
        "pooja room design",
        "bathroom interiors",
        "civil works interior",
        "lighting design interior",
        "wall design interior",
        "office furniture",
        "aluminum partitions",
        "interior services Bangalore",
    ],
    openGraph: {
        title: "Our Services | Arambha Design & Interior Studio",
        description:
            "Complete range of interior design services – kitchens, wardrobes, living rooms, false ceilings, furniture & more. Premium quality, affordable pricing.",
        url: "https://arambhainteriors.com/services",
        type: "website",
    },
    alternates: {
        canonical: "https://arambhainteriors.com/services",
    },
};

export default function ServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
