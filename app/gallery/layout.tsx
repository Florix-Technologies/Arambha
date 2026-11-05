import type { Metadata } from "next";
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
    title: "Gallery – Our Interior Design Projects & Portfolio",
    description:
        "Browse Arambha's completed interior projects in Bangalore, from luxury homes and modular kitchens to living rooms and more.",
    keywords: [
        "interior design portfolio Bangalore",
        "home interior gallery",
        "completed interior projects",
        "luxury home interiors",
        "interior design photos",
        "kitchen design gallery",
        "living room design gallery",
        "Arambha projects",
    ],
    openGraph: {
        title: "Gallery | Arambha Design & Interior Studio",
        description:
            "Browse our stunning portfolio of completed interior design projects. Luxury homes, modular kitchens, living rooms & more.",
        url: `${SITE_URL}/gallery`,
        type: "website",
        images: [{
            url: "/logo1.png",
            width: 1200,
            height: 630,
            alt: "Arambha Design & Interior Studio - Premium Interior Design",
        }],
    },
    alternates: {
        canonical: `${SITE_URL}/gallery`,
    },
};

export default function GalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
