import { SITE } from '@/lib/site';

export const metadata = { title: `Privacy Policy | ${SITE.name}` };

export default function Privacy() {
  return (
    <article style={{ maxWidth: 720, lineHeight: 1.7 }}>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: October 2026</p>
      <p>
        {SITE.name} is a demo online shop built as a learning project. This page explains what information we
        collect and how it is used.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name and email address, provided by Google when you choose &ldquo;Sign in with Google&rdquo;.</li>
        <li>The name and delivery address you enter at checkout.</li>
        <li>The items and total of each order you place.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To sign you in and keep you signed in.</li>
        <li>To save your orders and show them on your &ldquo;My orders&rdquo; page.</li>
        <li>To send you an order confirmation email.</li>
      </ul>

      <h2>Who processes your data</h2>
      <p>
        Your data is stored with Supabase (database and sign-in), emails are sent through Mailgun, Google handles
        the sign-in, and the site is hosted on Vercel. We do not sell your information or use it for advertising.
      </p>

      <h2>Payments</h2>
      <p>This is a demo shop. No real payment details are collected or processed.</p>

      <h2>Your choices</h2>
      <p>You can ask us to delete your account and orders at any time by contacting us at the email below.</p>

      <h2>Contact</h2>
      <p>manuelemperor@gmail.com</p>
    </article>
  );
}
