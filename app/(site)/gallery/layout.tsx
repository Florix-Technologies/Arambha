import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Interior Design Project Gallery",
    description: "Photos and videos of interiors completed by Arambha Design & Interior Studio in Bangalore, from kitchens and wardrobes to living rooms and furniture.",
    path: "/gallery",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
