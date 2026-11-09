import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Interior Design Project Gallery",
    description: "Project photos by Arambha Design & Interior Studio, Bangalore: complete house interiors, kitchens, living rooms, bedrooms and wardrobes. Book a consultation.",
    path: "/gallery",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
