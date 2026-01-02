# CiftlikPDF

A web application for the Village Ciftlik Köy community from Turkey, designed to streamline PDF creation processes based on user input.

## Features

- **User Management**: Registration, authentication, and user profile management
- **Sponsor Management**: Create, edit, and manage sponsors with their information
- **Donation Tracking**: Track and manage donations for sponsors
- **PDF Generation**: Generate custom PDFs based on user input and data
- **Admin Dashboard**: Comprehensive interface for managing users, sponsors, and donations

## Tech Stack

- **Frontend**: [SolidStart](https://start.solidjs.com/) - Solid.js meta-framework
- **Backend**: [SST](https://sst.dev) - Infrastructure as Code
- **Database**: [Turso](https://turso.tech) - SQLite-based database
- **PDF Generation**: Golang service for creating PDFs
- **Hosting**: Cloudflare infrastructure
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI components

## Project Structure

```
├── packages/app/          # SolidStart frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── routes/        # Page routes and API endpoints
│   │   ├── actions/       # Server actions
│   │   └── data/          # Data utilities and authentication
├── core/                  # Core business logic
│   ├── drizzle/          # Database migrations and schemas
│   └── entities/         # Data entities and PDF generation
└── functions/            # AWS Lambda functions
```

## Getting Started

### Prerequisites

- Node.js (or Bun)
- Cloudflare account configured with appropriate permissions
- Turso database account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ciftlikpdf.ch
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

4. Run database migrations:
   ```bash
   bun run db:migrate
   ```

5. Start the development server:
   ```bash
   bun run dev
   ```

## Deployment

The project uses SST for deployment to Cloudflare. To deploy:

```bash
bun run deploy
```

This project is made voluntarily and intended for use by the Village Ciftlik Köy community, but has no affiliation with the community.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.