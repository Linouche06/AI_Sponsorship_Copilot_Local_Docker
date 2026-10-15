# Application-data PostgreSQL extension (optional; not wired yet)

The existing PostgreSQL container is used by n8n. To meet a separate *application database persistence* rubric, create a dedicated database/schema and add PostgreSQL read/write nodes (e.g. a sponsorship event audit trail) to your workflows. Merely running PostgreSQL as n8n’s backing store does **not** establish project-level persistence. Use a separate DB user with limited permissions and parameterized queries.
