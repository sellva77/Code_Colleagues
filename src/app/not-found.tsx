import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap not-found">
      <p className="kicker">404</p>
      <h1>That page is not here.</h1>
      <p>The studio site is on the home page.</p>
      <Link className="btn btn-primary" href="/" style={{ justifySelf: "start", marginTop: 8 }}>
        Back to Code Colleagues
      </Link>
    </div>
  );
}
