# WorldLedger Module Federation Provider

This project is a **Module Federation Provider** built with [React](https://react.dev/) and [Material UI](https://mui.com/), powered by [Rsbuild](https://rsbuild.dev/) and [@module-federation/rsbuild-plugin](https://github.com/module-federation/rsbuild-plugin). It serves as a container application that exposes shared UI components and theming, enabling seamless integration and code sharing with remote consumer applications.

## Features

- **Module Federation Provider**: Exposes React components and shared theme for consumption by remote apps.
- **Material UI v7**: Custom theming and component overrides for a modern, consistent UI.
- **Crypto Dashboard Example**: Fetches and displays real-time cryptocurrency stats using the CoinGecko API.
- **TypeScript**: Fully typed codebase for safety and maintainability.
- **Ready for Integration**: Designed to be consumed by other micro-frontends via Module Federation.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or use `npm`/`yarn` as preferred)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-org/worldledger-mf-provider.git
cd worldledger-mf-provider
pnpm install
```

### Running Locally

Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

### Building for Production

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Module Federation

This project uses [Module Federation](https://webpack.js.org/concepts/module-federation/) to **expose React components and theming** to other applications at runtime. As a provider/container, it enables:

- **Code Sharing**: Consumer apps can dynamically load and use components (e.g., `<Provider />`) and themes without bundling them at build time.
- **Micro-Frontend Architecture**: Decouples feature development, allowing independent deployment and scaling of UI modules.
- **Version Independence**: Consumers can use the latest features and bug fixes without redeploying their own codebase.

### Exposed Modules

- `Provider`: The main UI provider component, exposing crypto stats and theming.

See [`module-federation.config.ts`](module-federation.config.ts) for configuration details.

## Environment Variables

Set your CoinGecko API credentials in `.env.local`:

```env
PUBLIC_COINGECKO_API_KEY="your-api-key"
PUBLIC_COINGECKO_URL="https://api.coingecko.com/api/v3"
```

## License

MIT

---

> **Note:** This project is intended to be used as a container/provider in a Module Federation setup. For consuming this provider in your remote applications, refer to the [Module Federation documentation](https://webpack.js.org/concepts/module-federation/).