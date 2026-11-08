import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Custom Furniture in Bangalore",
    description: "Handcrafted and custom furniture by Arambha Design & Interior Studio in Bangalore. Browse the furniture collection and request a design made to your needs.",
    path: "/furniture",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
