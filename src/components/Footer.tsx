import Link from "next/link";
import { business } from "@/lib/business";
import { CallIconLink, WhatsAppIconLink } from "./ContactIcons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div data-reveal>
          <Link href="/" className="logo">
            <Logo />
            <span>
              <strong>Code Colleagues</strong>
              <small>Software studio</small>
            </span>
          </Link>
          <p className="fine" style={{ marginTop: 12 }}>
            Websites, mobile apps, and databases, built and maintained by the team.
          </p>
        </div>
        <div data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          <h2>Contact</h2>
          <div className="icon-row" style={{ marginTop: 12 }}>
            <CallIconLink />
            <WhatsAppIconLink />
          </div>
          <ul className="footer-mails">
            <li>
              <span>Business</span>
              <a href={`mailto:${business.emailBusiness}`}>{business.emailBusiness}</a>
            </li>
            <li>
              <span>Personal</span>
              <a href={`mailto:${business.emailPersonal}`}>{business.emailPersonal}</a>
            </li>
          </ul>
        </div>
        <div data-reveal style={{ "--d": 2 } as React.CSSProperties}>
          <h2>Visit</h2>
          <ul>
            <li><Link href="/#services">Services</Link></li>
            <li><Link href="/#work">Work</Link></li>
            <li><Link href="/#about">About</Link></li>
            <li><Link href="/#contact">Start a project</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap legal">
        <p>© {new Date().getFullYear()} Code Colleagues</p>
      </div>
    </footer>
  );
}
