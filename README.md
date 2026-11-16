# Code Colleagues

Freelance studio website for the Code Colleagues team, with a public site, a project form, and an admin panel.

## Run it

```powershell
cd "C:\Users\user\Desktop\Code  Colleagues"
npm install
npm run dev
```

Open http://localhost:3000

Admin panel: http://localhost:3000/admin

Sign in with the email and password in `.env.local` (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Change that password before the site is published.

## Email to both inboxes

The form saves every inquiry in the admin panel. It also emails:

- ajayjegatheeswaranaj30@gmail.com
- codecolleagues@gmail.com

Gmail will only send after you add an App Password:

1. Sign in to the Gmail account in `SMTP_USER` (the business mail, codecolleagues@gmail.com).
2. Turn on 2-Step Verification.
3. Open Google Account, Security, App passwords, and create one for Mail.
4. Paste that password as `SMTP_PASS` in `.env.local` (spaces are fine).
5. Stop the site and run `npm run dev` again.
6. In the admin panel, use **Send test email**. Both inboxes should receive it.

If the business Gmail cannot send, set `SMTP_USER` and `SMTP_PASS` to the personal Gmail instead. `MAIL_TO` still lists both addresses, so both still receive each inquiry.

Until email is set up, new inquiries stay in the admin panel. After email works, open an old inquiry and use **Send email again**.
