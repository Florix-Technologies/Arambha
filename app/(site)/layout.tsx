import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import InquiryPopup from "@/components/layout/InquiryPopup";
import SectionBoundary from "@/components/ui/SectionBoundary";
export default function SiteLayout({ children }: {
    children: React.ReactNode;
}) {
    return <><SectionBoundary name="Navigation"><Navbar /></SectionBoundary><main>{children}</main><SectionBoundary name="Footer"><Footer /></SectionBoundary><SectionBoundary name="Inquiry popup"><InquiryPopup /></SectionBoundary></>;
}
