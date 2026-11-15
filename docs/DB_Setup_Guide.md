# Database Setup Guide

## 1. Overview

This guide explains how to install and configure the MySQL database for the **ISO 9001 Compliant IT Service Desk and Process Tracking System** project.

The database name is `helpdesk_db`.

## 2. Requirements

Before starting, make sure you have:

- MySQL Server 8.0 or later
- MySQL Workbench (recommended for running SQL files)
- The project's database files:
  - `schema.sql`
  - `seed.sql`

## 3. Database Files

The SQL files are located in:

`backend/src/db/`

- **schema.sql:** Creates the `helpdesk_db` database and its tables.
- **seed.sql:** Inserts sample users, SLA policies, and ticket data.

## 4. Creating the Database

Follow these steps to create the database:

1. Open MySQL Workbench.
2. Connect to your local MySQL Server.
3. Open the `schema.sql` file from `backend/src/db/`.
4. Execute the SQL script by clicking the lightning bolt button.
5. Check the output panel to make sure the script executed successfully.

The script creates the `helpdesk_db` database and the required tables.

## 5. Inserting Sample Data

After creating the database:

1. Open the `seed.sql` file from `backend/src/db/`.
2. Execute the script using the lightning bolt button.
3. Check the output panel for successful execution.

**Important:** Run `seed.sql` only once after creating a fresh database. Running it again may cause duplicate entry errors.

## 6. Verifying the Database

Open a new SQL query tab and execute:

```sql
USE helpdesk_db;

SHOW TABLES;
```

The following tables should appear:

- Users
- SLA_Policies
- Tickets
- Change_Requests
- Audit_Logs
- Customer_Feedback

To check whether sample data was inserted, execute:

```sql
SELECT * FROM Users;
SELECT * FROM SLA_Policies;
SELECT * FROM Tickets;
```

You should see the sample records returned by the queries.

## 7. Backend Database Configuration

The backend application should connect to the following database:

| Setting | Value |
|---|---|
| Host | localhost |
| Port | 3306 |
| Database | helpdesk_db |
| Username | Your MySQL username |
| Password | Your MySQL password |

Database credentials should be stored in the backend `.env` file.

Do not upload real database passwords or credentials to GitHub.

## 8. Troubleshooting

**Connection refused:**
- Make sure the MySQL Server service is running.
- Check the host and port settings.

**Access denied:**
- Check your MySQL username and password.
- Make sure the account has permission to access the database.

**Unknown database:**
- Make sure `schema.sql` was executed successfully.
- Check that the database name is `helpdesk_db`.

**Duplicate entry error:**
- Check whether `seed.sql` has already been executed.
- Do not run the sample data script repeatedly.

## 9. Setup Checklist

- [ ] MySQL Server installed and running.
- [ ] MySQL Workbench connected.
- [ ] `schema.sql` executed successfully.
- [ ] `seed.sql` executed successfully.
- [ ] All six database tables verified.
- [ ] Backend database connection settings configured.

