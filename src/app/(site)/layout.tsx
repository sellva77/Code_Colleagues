import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CallIconLink, WhatsAppIconLink } from "@/components/ContactIcons";
import { SiteMotion } from "@/components/SiteMotion";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <div className="topbar">
        <div className="wrap topbar-inner">
          <p>Websites, mobile apps, and database care</p>
          <span className="topbar-actions">
            <CallIconLink className="on-dark" />
            <WhatsAppIconLink className="on-dark" />
          </span>
        </div>
      </div>
      <Header />
      <SiteMotion />
      <main id="content">{children}</main>
      <Footer />
      <nav className="mobile-bar" aria-label="Quick contact">
        <CallIconLink />
        <WhatsAppIconLink />
        <a href="/#contact">Enquire</a>
      </nav>
    </div>
  );
}
