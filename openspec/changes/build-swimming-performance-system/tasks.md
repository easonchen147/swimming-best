## 1. Repository And Scaffolding

- [x] 1.1 Create repo hygiene files, design docs, OpenSpec artifacts, and a feature branch for implementation
- [x] 1.2 Verify latest stable frontend/tooling versions and scaffold the Next.js frontend
- [x] 1.3 Initialize the Go backend module, dependencies, and shared run/test scripts
- [x] 1.4 Validate the clean scaffold with frontend lint/build and backend tests

## 2. Backend Core

- [x] 2.1 Implement config loading, hashed admin authentication, cookie sessions, and auth middleware with tests
- [ ] 2.2 Implement SQLite schema setup, migrations, and repositories for swimmers, events, contexts, performances, goals, and tags
- [ ] 2.3 Implement admin APIs for swimmer management, event management, quick entry, context entry, and goal management
- [ ] 2.4 Validate backend behavior with repository, service, and HTTP tests

## 3. Analytics And Public APIs

- [ ] 3.1 Implement PB detection, trend data, goal progress, and same-event comparison services
- [ ] 3.2 Implement public APIs with visibility filtering and public-safe payloads
- [ ] 3.3 Validate analytics and public payloads with automated tests

## 4. Frontend Foundation

- [ ] 4.1 Establish the design system, responsive layout primitives, and shared app shell for admin and public routes
- [ ] 4.2 Integrate shadcn/ui components, charting, and motion accents aligned to the swimming performance theme
- [ ] 4.3 Validate the shared shell and responsive primitives with frontend tests

## 5. Admin Experience

- [ ] 5.1 Build admin login and dashboard pages
- [ ] 5.2 Build swimmer, event, performance, context, and goal management flows
- [ ] 5.3 Validate admin flows with component/integration tests

## 6. Public Experience

- [ ] 6.1 Build public swimmer list, swimmer detail, event detail, compare, and share pages
- [ ] 6.2 Ensure public and admin pages adapt correctly across desktop and mobile viewports
- [ ] 6.3 Validate public UX with frontend tests and end-to-end coverage

## 7. Final Verification And Release

- [ ] 7.1 Run the complete backend and frontend verification suite from a clean state
- [ ] 7.2 Perform manual smoke checks for desktop and mobile layouts
- [ ] 7.3 Update README and task tracking to match the verified implementation
- [ ] 7.4 Commit the final verified state and archive the OpenSpec change with synced specs
