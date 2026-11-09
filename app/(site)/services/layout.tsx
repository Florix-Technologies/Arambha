import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Interior Design Services Bangalore",
    description: "Interior design services in Bangalore by Arambha: modular and hybrid interiors, kitchens, wardrobes, living rooms, pooja rooms, false ceilings and flooring.",
    path: "/services",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
