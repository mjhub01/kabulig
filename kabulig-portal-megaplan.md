# Kabulig Portal — Megaplan

## 1. Vision

Kabulig Portal is a trusted online marketplace and learning hub that connects local producers, tourism providers, learners, and communities. It brings three pillars together under one account, catalog, checkout, and support experience:

1. **Agri-Fishery** — discover and order local farm and fishery products, produce boxes, and value-added goods.
2. **Tourism** — find and book local tours, activities, stays, and community experiences.
3. **Education** — learn through online courses, workshops, and practical learning resources.

The portal should make it easy for a customer to discover, learn, book, and buy, while giving local partners straightforward tools to manage their offers and fulfill orders.

## 2. Product principles

- **One portal, three clear pillars:** shared navigation and accounts, with distinct catalog and fulfillment rules for each pillar.
- **Start focused:** launch with a small, vetted group of providers and a limited set of offers; expand after the operating process works.
- **Mobile-first and low-bandwidth friendly:** fast pages, compressed media, clear calls to action, and graceful behavior on slower connections.
- **Trust is part of the product:** show provider details, availability, policies, reviews when verified, and clear refund or cancellation terms.
- **People remain in control:** providers confirm availability and fulfillment; admins can resolve exceptions and keep listings accurate.

## 3. Audiences and roles

| Role | Main needs |
|---|---|
| Visitor / customer | Browse, compare, buy or book, pay, track status, access purchased courses, and get help |
| Producer / seller | Maintain products, stock, pricing, pickup or delivery details, and order status |
| Tourism provider | Manage experiences, schedules, capacity, booking requests, and guest instructions |
| Instructor / course provider | Publish course information, lessons, downloadable resources, and learner progress |
| Portal administrator | Approve partners and listings, manage categories, orders, bookings, content, refunds, and reports |
| Support / operations staff | Answer questions and handle order, booking, and course-access issues with a clear audit trail |

One person may have more than one role. Use role-based permissions and provider organizations so staff can collaborate without sharing passwords.

## 4. Customer experience and core journeys

### Shared entry points

- Home page introduces the portal and links to the three pillars.
- Search and filters work within a pillar; results identify whether an item is a product, booking, or course.
- Each listing has a provider profile, location or service area, price, availability, terms, and a clear next action.
- Customer account centralizes orders, bookings, course access, saved items, and support requests.

### Agri-Fishery journey

Browse products → select quantity and fulfillment option → checkout → receive order updates → pickup or delivery → review or request help.

Plan for variable stock, harvest dates, minimum quantities, delivery zones, and perishable-product handling. The first version can use provider-confirmed stock and manual fulfillment updates.

### Tourism journey

Browse experiences → choose date/time and party size → submit booking or pay if instant confirmation is supported → provider confirms → receive itinerary and meeting details → attend → review or request help.

Do not show a booking as confirmed until capacity and provider availability are confirmed. Support cancellation windows, weather-related changes, and accessibility or safety notes.

### Education journey

Browse course → review syllabus, instructor, level, format, and access period → enroll and pay or enroll in a free course → access lessons → track progress → complete and receive a completion record where configured.

Keep the initial course experience simple: modules, lessons, video or embedded media, text, downloadable resources, and progress tracking. Avoid building live video infrastructure into the first release.

## 5. Business model options

Select and publish the actual rates before launch; these are options, not assumed pricing:

- Commission on completed product orders and tourism bookings.
- Course sale revenue share or instructor subscription.
- Featured listings or partner subscription, clearly labeled as promotional.
- Optional service fees where disclosed before checkout.
- Community, institutional, or sponsored learning programs.

Define who collects payment, when providers are paid, how refunds and chargebacks are handled, and whether taxes or delivery fees are included. Confirm the applicable payment, consumer, tax, privacy, and tourism requirements for the operating location before accepting real transactions.

## 6. MVP scope

### Include in the first usable release

- Responsive public site, pillar landing pages, category browsing, search, and listing detail pages.
- Account registration, sign-in, password reset, and customer profile.
- Provider onboarding request and admin approval.
- Provider dashboard to create and edit listings, subject to moderation.
- Product catalog and basic stock/availability controls.
- Tourism availability calendar with request-to-book and provider confirmation.
- Course catalog, paid or free enrollment, lesson access, and basic progress tracking.
- Cart and checkout for compatible items, with clear fulfillment and terms.
- Order, booking, and enrollment records in the customer account.
- Email notifications for account, order, booking, and course events.
- Admin tools for users, partners, listings, categories, transactions, and support issues.
- Basic analytics for visits, conversion, order/booking status, enrollment, and provider activity.

### Defer until validated

- Native mobile apps, complex route planning, dynamic pricing, multi-vendor split settlements, loyalty points, discussion forums, live classes, advanced certificates, automated perishable-goods logistics, and AI recommendations.

## 7. Suggested technical architecture

Use a conventional PHP web application that can launch as a well-structured monolith. This keeps the first release easier to build and operate while leaving room to separate services later if scale requires it.

| Layer | Suggested approach |
|---|---|
| Backend | PHP 8.x with Laravel (recommended) for routing, validation, authentication, queues, notifications, and migrations |
| Front end | Blade templates with Bootstrap 5 and JavaScript; add small interactive components where needed |
| Database | PostgreSQL with foreign keys, transactions, indexes, and explicit status histories |
| Media | Object storage for product photos, course materials, and tourism media; store metadata and access rules in PostgreSQL |
| Background work | Laravel queues for email, media processing, and other retryable tasks |
| Payments | Integrate a payment provider available in the operating country; use hosted or tokenized checkout and verify payment callbacks server-side |
| Hosting | Managed PHP hosting or a managed VPS, with HTTPS, automated backups, staging, and production environments |
| Operations | Centralized application logs, error reporting, uptime checks, database backup checks, and deployment notes |

Use JavaScript for date selection, cart updates, filters, and lesson interactions; keep essential browsing and checkout flows usable without heavy client-side code.

### Application boundaries

Organize the code into clear modules: Accounts and Roles, Providers, Catalog, Orders, Tourism Bookings, Courses and Enrollments, Payments, Notifications, Reviews, and Administration. Keep each pillar's business rules separate while reusing accounts, providers, checkout, notifications, and reporting.

## 8. Initial data model

- **users** and **roles/permissions** — identity and access.
- **organizations/providers** and **provider_members** — partner profile and team membership.
- **listings** — shared title, description, pillar, status, provider, location/service area, and media references.
- **products**, **inventory**, and **fulfillment_options** — product-specific pricing, quantity, and fulfillment rules.
- **experiences**, **availability_slots**, and **bookings** — tourism-specific capacity, dates, guest count, and confirmation state.
- **courses**, **modules**, **lessons**, **enrollments**, and **lesson_progress** — learning content and learner access.
- **carts**, **orders**, **order_items**, **payments**, and **refunds** — commerce and payment records.
- **reviews**, **notifications**, and **support_cases** — post-purchase trust and service.

Keep a shared listing identity, but do not force products, bookings, and courses into one generic table for their unique operational fields. Store money as currency plus integer minor units (for example cents), and record status changes with timestamps and responsible actors.

## 9. Security, privacy, and reliability requirements

- Use a supported PHP version, framework security features, prepared database access, CSRF protection, output escaping, and server-side authorization checks.
- Require HTTPS; hash passwords with framework defaults; rate-limit sign-in and sensitive endpoints; protect admin accounts with stronger authentication where available.
- Never store raw payment card data. Verify provider callbacks and make payment/order operations idempotent.
- Collect only needed personal data, document retention and deletion rules, and restrict access to learner and customer records.
- Validate uploads, limit file type and size, scan files where available, and use private storage for paid course materials.
- Back up PostgreSQL automatically and periodically verify that a restore works.
- Define service ownership for failed payments, duplicate callbacks, provider no-shows, refunds, and unavailable inventory.

## 10. Phased delivery roadmap

Durations are planning estimates and depend on team size, content readiness, payment-provider access, and operating decisions.

| Phase | Focus | Exit condition |
|---|---|---|
| 0. Discovery and decisions (1–2 weeks) | Confirm launch area, audience, provider cohort, payment and payout model, fulfillment policies, course format, and success measures | Signed-off MVP, operating policies, initial partner list, and content owners |
| 1. Foundation (2–3 weeks) | UX flows, visual identity, environments, database structure, authentication, roles, provider onboarding, and admin shell | A provider can be approved and a draft listing can be reviewed in staging |
| 2. Pillar catalogs (3–5 weeks) | Product listings, tourism experiences and availability, course catalog and lesson structure | Admin-approved listings for all three pillars display correctly on mobile |
| 3. Commerce and fulfillment (3–5 weeks) | Checkout, payment integration, order lifecycle, booking confirmation, enrollment, notifications, and refunds workflow | A pilot customer can complete each supported purchase/enrollment and see its status |
| 4. Pilot and launch readiness (2–3 weeks) | Load real content, train providers and admins, test operational scenarios, fix issues, prepare support and launch communications | Pilot partners complete real workflows; support, backup, and incident procedures are ready |
| 5. Public launch and iteration (ongoing) | Expand supply, improve conversion and operations, prioritize improvements from customer/provider feedback | Monthly review shows healthy fulfillment, support, and repeat usage |

## 11. Launch checklist

- Confirm brand name availability, domain, logo, and visual system.
- Select the launch geography and define delivery coverage and tourism service areas.
- Recruit a small initial cohort: a few producers, tourism providers, and course instructors.
- Prepare quality photos, accurate descriptions, prices, stock/availability, and policies for each listing.
- Publish terms, privacy notice, refund/cancellation rules, provider agreement, and support contact.
- Set up payment settlement, email delivery, backups, error reporting, and administrator access.
- Walk through purchase, booking, cancellation, refund, course access, password reset, and provider unavailability scenarios.
- Train support and partners; provide a simple provider guide and escalation contact.
- Launch to a controlled audience, review issues daily, then widen access when fulfillment is reliable.

## 12. Measures of success

Track a small set of measures from the start:

- **Supply:** approved active providers and live listings per pillar.
- **Discovery:** search-to-listing clicks and listing views by pillar.
- **Conversion:** listing-to-order, listing-to-booking, and course enrollment rates.
- **Fulfillment:** paid orders completed, booking confirmation time, cancellations, refunds, and provider response time.
- **Learning:** course starts, lesson completion, and course completion.
- **Trust:** support cases per transaction, review rate, repeat purchase, and customer satisfaction.
- **Platform health:** page performance, error rate, payment failure rate, and backup restore readiness.

Set target values after the pilot establishes a baseline rather than inventing targets before there is usage data.

## 13. Key risks and responses

| Risk | Response |
|---|---|
| Too few listings make the portal feel empty | Launch in a focused geography with committed providers and complete listings in all three pillars |
| Stock or availability is inaccurate | Require provider confirmation, show last-updated information, and make cancellation/refund steps clear |
| Different purchase types complicate checkout | Keep distinct order, booking, and enrollment lifecycles; initially limit mixed carts if fulfillment policies conflict |
| Providers struggle with dashboards | Provide onboarding, simple forms, mobile-friendly tools, and an admin-assisted option during the pilot |
| Payments or refunds are unreliable | Choose a supported provider early, test callback and refund flows in staging, and document manual exception handling |
| Course content is costly to produce | Start with a small number of instructor-led courses and use a repeatable course publishing template |
| Trust or safety issue damages reputation | Vet partners, publish clear policies, provide an accessible support path, and respond quickly to reported issues |

## 14. Decisions to settle before development

1. Where will Kabulig Portal launch first, and which communities or service areas are included?
2. Which payment methods and payout schedule will providers use?
3. Will tourism bookings require provider approval, instant confirmation, or vary by experience?
4. Will products be pickup-only initially, or will the portal coordinate delivery?
5. Are courses self-paced only at launch, and what counts as completion?
6. Who owns partner verification, listing approval, customer support, and refund decisions?
7. What languages and currencies are required at launch?

These decisions affect policies and configuration, but the proposed architecture supports them without changing the three-pillar concept.
