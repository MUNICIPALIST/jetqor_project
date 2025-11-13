# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `pnpm dev` (runs on port 3000)
- **Build**: `pnpm build`
- **Type checking**: `pnpm typecheck`
- **Linting**: `pnpm lint`
- **Preview build**: `pnpm preview`
- **Update dependencies**: `pnpm up`

## Project Architecture

JetQor is a Vue 3 warehouse management system built with modern tooling and feature-based architecture.

### Tech Stack
- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Vite** for build tooling with auto-imports enabled
- **UnoCSS** for utility-first styling with custom design system
- **Pinia** for state management + **Pinia Colada** for data fetching
- **Vue Router** with file-based routing and layouts
- **Vue I18n** for internationalization (Russian/Kazakh)

### Feature Organization
Each feature is self-contained in `/src/features/[feature-name]/` with:
- `components/` - Vue components (includes modals/ subdirectory)
- `composables/` - Reusable composition functions
- `queries/` - Data fetching logic using Pinia Colada
- `services/` - API communication and business logic
- `stores/` or `store/` - Pinia stores for state management
- `types/` - TypeScript type definitions

### Key Features
- **orders**: Order processing and assembly workflows
- **products**: Product catalog and management
- **warehouses**: Multi-warehouse with cell-based organization
- **invoices**: Client billing and approval workflows
- **users**: User management with role-based access
- **user**: Current user profile management

### Auto-Import System
The following are auto-imported and don't need explicit imports:
- Vue APIs (`ref`, `computed`, `watch`, etc.)
- VueUse composables (`@vueuse/core`)
- Vue Router functions
- Custom composables from `/src/composables/`
- Utility functions from `/src/utils/`
- Vue components are auto-registered

### API Integration
- API client configured in `~/plugins/api` using `ofetch`
- Authentication via localStorage token
- Auth middleware redirects unauthenticated users to `/login`
- Data fetching uses Pinia Colada's `defineQuery` and `useQuery`

### State Management Patterns
- Pinia stores use Composition API syntax with `defineStore(() => {})`
- Complex state like product distribution uses detailed computed properties
- Modal state managed through dedicated composables (e.g., `useAddOrderModal`)

### Styling System
- Custom design system in `uno.config.ts` with brand colors:
  - Primary: `#EA6001` (main)
  - Secondary: `#0A2635` (second)
  - Background: `#F4F4F4`
- Typography shortcuts for consistent headings and body text
- Custom icons loaded from `/assets/icons/` with `i-jq-` prefix

### Routing & Layouts
- File-based routing with pages in `/src/pages/`
- Layout system with multiple layouts: default, login, settings, small
- Auth middleware protects authenticated routes

### Development Notes
- Run type checking before committing changes
- Use the established feature structure when adding new functionality
- Follow existing naming conventions for stores and composables
- Modals are managed through dedicated composables and use vue-final-modal
- All user-facing text should be internationalized using vue-i18n