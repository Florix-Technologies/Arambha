import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: "Our Services – Modular Kitchens, Wardrobes, Living Rooms & More",
    description:
        "Explore Arambha's interior design services in Bangalore: kitchens, wardrobes, living rooms, ceilings, lighting, furniture, civil works and partitions.",
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
        url: `${SITE_URL}/services`,
        type: "website",
        images: [{
            url: "/logo1.png",
            width: 1200,
            height: 630,
            alt: "Arambha Design & Interior Studio - Premium Interior Design",
        }],
    },
    alternates: {
        canonical: `${SITE_URL}/services`,
    },
};

export default function ServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
