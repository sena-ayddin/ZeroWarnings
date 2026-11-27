[KPI_CSAT_Formulas.md](https://github.com/user-attachments/files/35524658/KPI_CSAT_Formulas.md)

# SDS-07 – KPI & CSAT Formulas

**Responsible:** Gülçin Hacıimam – Quality Assurance & Process Specialist

## 1. MTTR (Mean Time to Resolution)

Average business minutes between `Tickets.created_at` and `Tickets.resolved_at` for tickets whose status is `Resolved` or `Closed`. The calculation uses the same Monday–Friday, 09:00–18:00 business calendar as `slaService`.

`MTTR = SUM(business_minutes(created_at, resolved_at)) / COUNT(resolved tickets)`

## 2. SLA Compliance Rate

The existing `/api/kpi` implementation calculates: `resolved_on_time / (resolved_tickets + open_overdue_tickets) * 100`. A resolved ticket is on time when `resolved_at <= resolution_due_at`; an open ticket is overdue when `resolution_due_at < NOW()`.

## 3. CSAT (Customer Satisfaction Score)

Feedback is stored in `Customer_Feedback.satisfaction_rating` (integer 1–5).

`Average CSAT = AVG(satisfaction_rating)`

The API returns `total_feedback` and `average_csat` in the administrator KPI response. A feedback entry is accepted once per ticket, only from the ticket owner, and only after the ticket is `Resolved` or `Closed`.

## 4. API

`POST /api/tickets/:id/feedback` (authenticated ticket owner)

Request body:

```json
{ "satisfaction_rating": 5, "comments": "Problem hızlı çözüldü." }
```

The feedback insert and its `Audit_Logs` record are committed in one transaction.

## 5. FCR (First Contact Resolution)

FCR measures the proportion of resolved tickets that were resolved at the first contact without escalation. For this project, the agreed proxy is `escalation_level = 1` at resolution.

`FCR (%) = (resolved tickets with escalation_level = 1 / all resolved tickets) * 100`

Use tickets with status `Resolved` or `Closed` in both numerator and denominator. If there are no resolved tickets, report FCR as `N/A` (not 0%). This proxy should be interpreted consistently and documented when reporting.

## 6. CSAT Results API

`GET /api/feedback` (Administrator only; JWT required) returns feedback rows with `ticket_number`, `satisfaction_rating`, `comments`, and `created_at`.
