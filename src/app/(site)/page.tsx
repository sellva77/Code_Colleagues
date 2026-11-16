import { ContactForm } from "@/components/ContactForm";
import { CallIconLink, EmailIconLink, WhatsAppIconLink } from "@/components/ContactIcons";
import { Logo } from "@/components/Logo";
import { WorkCases } from "@/components/WorkCases";
import { business, services, steps } from "@/lib/business";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: business.name,
  email: business.emailBusiness,
  description:
    "Freelance studio for websites, mobile apps, and database maintenance.",
  makesOffer: services.map((service) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: service.title },
  })),
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="orb orb-a" aria-hidden />
        <div className="orb orb-b" aria-hidden />
        <div className="wrap hero-grid">
          <div className="rise">
            <h1>
              We build the software, then we <em>maintain</em> it.
            </h1>
            <p className="lede">
              Code Colleagues is a studio team. Websites, mobile apps, and the databases
              behind them, carried through launch and looked after afterwards.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Start a project
              </a>
              <a className="btn btn-ghost" href="#work">
                See recent work
              </a>
            </div>
            <p className="trust-line">
              <CallIconLink labeled />
              <WhatsAppIconLink labeled />
              <EmailIconLink labeled />
            </p>
          </div>
          <article className="docket" aria-label="What the studio takes on">
            <header>
              <span>Studio docket</span>
              <span>CC</span>
            </header>
            <h2>What we take on</h2>
            <ul>
              <li>
                <span>01</span> Websites
              </li>
              <li>
                <span>02</span> Mobile apps
              </li>
              <li>
                <span>03</span> Databases
              </li>
              <li>
                <span>04</span> Maintenance
              </li>
              <li>
                <span>05</span> AI
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="band do-band" id="services">
        <div className="wrap do-layout">
          <div className="do-intro" data-reveal>
            <p className="kicker">What we do</p>
            <h2>Turning ideas into digital solutions.</h2>
            <p>
              From websites and mobile applications to enterprise platforms and intelligent
              automation, we design, develop, and deliver digital solutions that solve real
              business challenges.
            </p>
          </div>
          <ol className="practice-list" data-reveal>
            {services.map((service) => (
              <li key={service.number}>
                <span>{service.number}</span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="wrap">
          <div className="care-band" data-reveal>
            <div>
              <h3>Already have a site, an app, or a database?</h3>
              <p className="fine" style={{ marginTop: 6 }}>
                We take on existing projects as well: fixes, updates, and regular care.
              </p>
            </div>
            <a className="btn btn-green" href="#contact">
              Ask about maintenance
            </a>
          </div>
        </div>
      </section>

      <section className="band promise-band" id="promise">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker">How we deliver</p>
            <h2>Delivered and done. Low cost. Faster delivery.</h2>
            <p>
              A project from the team is finished and handed over. The cost stays low, and the
              delivery is quicker.
            </p>
          </div>
          <div className="promise-grid">
            <article className="promise-card" data-reveal>
              <span>01</span>
              <h3>Delivered and done</h3>
              <p>The website, app, or database is completed and given to you, ready to use.</p>
            </article>
            <article className="promise-card" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
              <span>02</span>
              <h3>Low cost</h3>
              <p>The price stays modest. You hear the cost before the build starts.</p>
            </article>
            <article className="promise-card" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
              <span>03</span>
              <h3>Faster delivery</h3>
              <p>The work moves quickly, so the finished project reaches you sooner.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="work-band" id="work">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker">Selected work</p>
            <div className="work-open-row">
              <h2>Work already delivered.</h2>
              <WorkCases />
            </div>
            <p>
              PSB Travels and Ksp Transports shipped as a website and a mobile app. Earlier work
              includes Banking Wallet, Library Arrangements, and a visitor management process
              for a large industry, delivered successfully.
            </p>
          </div>
        </div>
      </section>

      <section className="band" id="process">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <p className="kicker">Process</p>
            <h2>How a project runs.</h2>
          </div>
          <ol className="steps">
            {steps.map((step, index) => (
              <li data-reveal style={{ "--d": index } as React.CSSProperties} key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band" id="about" style={{ paddingTop: 0 }}>
        <div className="wrap about-grid">
          <article className="about-card" data-reveal>
            <div className="portrait" aria-hidden>
              <Logo />
            </div>
            <p className="kicker">The studio</p>
            <h2 style={{ marginTop: 8 }}>The team</h2>
            <p style={{ marginTop: 12 }}>
              The team builds and maintains the work. You speak with the people who write the
              code, from the first call through launch and the upkeep after it.
            </p>
            <p style={{ marginTop: 12 }}>
              Delivered work includes the PSB Travels and Ksp Transports websites and apps,
              Banking Wallet, Library Arrangements, a visitor management process for a large
              industry.
            </p>
          </article>
          <article className="about-card" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <p className="kicker">Direct lines</p>
            <h2 style={{ marginTop: 8 }}>Call, write, or message.</h2>
            <div className="icon-row" style={{ margin: "16px 0 8px" }}>
              <CallIconLink />
              <WhatsAppIconLink />
            </div>
            <ul className="contact-list">
              <li>
                <span>Business email</span>
                <a href={`mailto:${business.emailBusiness}`}>{business.emailBusiness}</a>
              </li>
              <li>
                <span>Personal email</span>
                <a href={`mailto:${business.emailPersonal}`}>{business.emailPersonal}</a>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="band" id="contact" style={{ paddingTop: 0 }}>
        <div className="wrap contact-grid">
          <aside className="contact-panel" data-reveal>
            <p className="kicker">Contact</p>
            <h2>Talk to the team.</h2>
            <p style={{ marginTop: 12 }}>
              Share the project on the form. The details are emailed straight to the studio.
            </p>
            <div className="icon-row" style={{ marginTop: 16 }}>
              <CallIconLink className="on-dark" />
              <WhatsAppIconLink className="on-dark" />
            </div>
            <ul className="contact-list">
              <li>
                <span>Business email</span>
                <a href={`mailto:${business.emailBusiness}`}>{business.emailBusiness}</a>
              </li>
              <li>
                <span>Personal email</span>
                <a href={`mailto:${business.emailPersonal}`}>{business.emailPersonal}</a>
              </li>
            </ul>
          </aside>
          <div className="form-card" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
            <h2>Start a project</h2>
            <p className="fine" style={{ margin: "8px 0 18px" }}>
              Name, phone, and a short note are enough to begin. Email is optional.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
