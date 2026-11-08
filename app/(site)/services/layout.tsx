import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
    title: "Interior Design Services in Bangalore",
    description: "Interior services by Arambha in Bangalore: modular and hybrid interiors, kitchens, wardrobes, living rooms, pooja rooms, false ceilings, flooring, lighting, furniture and aluminum partitions.",
    path: "/services",
});

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
