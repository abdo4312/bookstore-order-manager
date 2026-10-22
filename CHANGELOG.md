# Changelog

## 2.4.0 — Portfolio snapshot (2026-10-22)

### Added

- Public showcase documentation (`README.md`, `SECURITY.md`, `LICENSE`).
- Environment template (`.env.example`) and Vite type definitions.
- Architecture and security documentation.

### Changed

- Supabase configuration moved from hardcoded values to environment variables.
- Admin panel password moved to `VITE_ADMIN_PASSWORD`.
- Build publish target updated to the public showcase repository.
- Dev server restricted to `localhost` by default.

### Removed

- Real customer database and Electron cache.
- Hardcoded credentials and migration scripts.
- Build artifacts and archives.

### Security

- No real customer data or credentials are included in this repository.
- Supabase RLS must be configured before production use.
