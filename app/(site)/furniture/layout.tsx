import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Custom Furniture in Bangalore",
    description: "Custom furniture by Arambha Design & Interior Studio in Bangalore, including office and commercial furniture. Browse the collection and book a consultation.",
    path: "/furniture",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
