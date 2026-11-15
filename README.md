# Kabulig Portal

A PHP storefront prototype for Kabulig Portal with distinct pages for Agri-Fishery, Tourism, and Education. It uses the `kabulig.png` logo at the project root.

## Run locally

Requires PHP 8.1+. The local launcher loads `pdo_pgsql`; PostgreSQL is required for persistent accounts and admin features.

```sh
.\run-portal.ps1
```

Open <http://127.0.0.1:8000>. On this Windows workspace, use `.\run-portal.ps1` in PowerShell; it loads `pdo_pgsql` and sets a writable PHP session directory.

## Pages

Each pillar opens directly to its first navigation page. The secondary navbar sits directly beneath the main navbar and links to the other pages in that pillar.

- `/` — portal home and pillar navigation.
- `/projects.php` — featured Kabulig projects and project links.
- `/about.php`, `/contact.php`, `/linkages.php`, and `/support.php` — portal information and help pages.
- `/account.php` — PostgreSQL-backed registration/login. A single account can hold multiple pillar roles and add roles later.
- `/admin.php` — administrator role review and account assignment management.
- `/agri-fishery/` → `/agri-fishery/market.php` — market with featured crop status; other pages: `services.php`, `work-earnings.php`, and `land-experiences.php`.
- `/tourism/` → `/tourism/experiences.php` — other pages: `sightseeing.php`, `farm-stays.php`, and `land-listings.php`.
- `/education/` → `/education/courses.php` — other pages: `my-learning.php` and `learning-guide.php`.

## PostgreSQL

Copy `.env.example` to `.env` and set the PostgreSQL credentials. The app loads `.env` automatically. Ensure `pdo_pgsql` is enabled (the Windows launcher loads it explicitly). For an existing installation, apply `migrations/002_multi_pillar_roles.sql`. Roles are assigned independently by pillar; employer/worker, host, and instructor access starts pending administrator review.

Create the first administrator after applying the schema with `php seed_admin.php`. By default it creates `admin@kabulig.local` and prints a cryptographically random one-time password. Set `KABULIG_ADMIN_EMAIL`, `KABULIG_ADMIN_NAME`, and optionally `KABULIG_ADMIN_PASSWORD` before running it to customize the account. If the email already exists, it adds the admin role without changing that account's password.

Published database listings replace the sample catalog. If PostgreSQL is unreachable, the sample catalog is shown.

## Prototype behavior and production work

Basket quantities, booking requests, course enrollments, farm job posts, worker profiles, job applications, contact/support requests, earnings, crop status, and land listings remain prototype/sample features. Account registration/login and role assignments persist in PostgreSQL. Farm Services has separate **Hire Farm Workers** and **Find Farm Work** tabs.
