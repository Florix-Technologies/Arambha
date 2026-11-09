import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Home Interior Designs in Bangalore",
    description: "Browse home interior designs by Arambha Design & Interior Studio in Rajajinagar, Bangalore: modular, wooden and aluminum interiors for homes and commercial spaces. Book a design consultation.",
    path: "/interiors",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
