export const business = {
  name: "Code Colleagues",
  team: "the team",
  phoneTel: "+918675767200",
  whatsapp: "918675767200",
  emailBusiness: "codecolleagues@gmail.com",
  emailPersonal: "ajayjegatheeswaranaj30@gmail.com",
};

export const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent("Hello Code Colleagues, I want to talk about a project.")}`;

export const serviceOptions = [
  "Website",
  "Mobile app",
  "Database setup or maintenance",
  "Website and mobile app",
  "AI",
  "Full project",
  "Something else",
] as const;

export const services = [
  {
    number: "01",
    title: "Web Application Development",
    text: "Building modern, responsive, and scalable web applications tailored to business requirements.",
  },
  {
    number: "02",
    title: "Mobile Application Development",
    text: "Creating powerful Android and cross-platform mobile applications for seamless user experiences.",
  },
  {
    number: "03",
    title: "Custom Software Development",
    text: "Developing business-specific software, management systems, dashboards, and workflow solutions.",
  },
  {
    number: "04",
    title: "API & Backend Development",
    text: "Building secure backend systems, REST APIs, database architectures, and third-party integrations.",
  },
  {
    number: "05",
    title: "Enterprise Solutions & Integrations",
    text: "Connecting business applications with enterprise platforms, ERP systems, and external services.",
  },
  {
    number: "06",
    title: "AI & Intelligent Automation",
    text: "Integrating AI-powered features, intelligent workflows, and automation to improve business efficiency.",
  },
  {
    number: "07",
    title: "UI/UX & Product Design",
    text: "Designing intuitive, user-friendly interfaces that make digital products easier to use.",
  },
  {
    number: "08",
    title: "Cloud, Deployment & Maintenance",
    text: "Managing application hosting, deployment, performance optimization, and ongoing technical support.",
  },
];

export const projects = [
  {
    name: "PSB Travels",
    mark: "PSB",
    field: "Travel",
    variant: "travel" as const,
    line: "Website and app",
    tags: ["Website", "Mobile app"],
    summary:
      "Website and mobile app for PSB Travels, so the travel business is present in a browser and on a phone.",
  },
  {
    name: "Ksp Transports",
    mark: "KSP",
    field: "Transport",
    variant: "transport" as const,
    line: "Website and app",
    tags: ["Website", "Mobile app"],
    summary:
      "Website and mobile app for Ksp Transports, covering the company’s site and a mobile app delivered with it.",
  },
  {
    name: "Banking Wallet",
    mark: "BW",
    field: "Banking",
    variant: "wallet" as const,
    line: "Earlier project",
    tags: ["Banking", "Wallet"],
    summary: "Banking Wallet, one of the earlier projects delivered by the team.",
  },
  {
    name: "Library Arrangements",
    mark: "LIB",
    field: "Library",
    variant: "library" as const,
    line: "Earlier project",
    tags: ["Library"],
    summary: "Library Arrangements, an earlier project for arranging a library’s records.",
  },
  {
    name: "Visitor Management",
    mark: "VM",
    field: "Industry",
    variant: "industry" as const,
    line: "Delivered successfully",
    tags: ["Visitor management", "Large industry"],
    summary:
      "A visitor management process for a large industry, delivered successfully by the team.",
  },
];

export const steps = [
  {
    number: "01",
    title: "You get in touch",
    text: "Use the form, call, or WhatsApp. Say whether you need a new website, an app, a database, or care for work that already exists.",
  },
  {
    number: "02",
    title: "We agree the work",
    text: "The team replies with what will be built, how long it is likely to take, and the cost, before the build starts.",
  },
  {
    number: "03",
    title: "We build and you review",
    text: "You see the site or app while it is coming together, and you can ask for corrections before it goes live.",
  },
  {
    number: "04",
    title: "We launch and maintain",
    text: "After launch we stay available for fixes, database care, and the next change the business needs.",
  },
];

export const mailRecipients = [business.emailPersonal, business.emailBusiness];
