import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gallery – Our Interior Design Projects & Portfolio",
    description:
        "Browse Arambha's stunning portfolio of completed interior design projects in Bangalore. See our work in modular interiors, luxury homes, kitchens, living rooms, and more.",
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
        url: "https://arambhainteriors.com/gallery",
        type: "website",
    },
    alternates: {
        canonical: "https://arambhainteriors.com/gallery",
    },
};

export default function GalleryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
