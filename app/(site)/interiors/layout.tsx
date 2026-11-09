import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Home Interior Designs in Bangalore",
    description: "Interiors by Arambha Design & Interior Studio, Rajajinagar, Bangalore: modular kitchens, wardrobes, living rooms and aluminium interior systems. Book a visit.",
    path: "/interiors",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
