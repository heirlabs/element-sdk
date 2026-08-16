# HEIR Elements SDK

<div align="center">
  <img src="assets/images/heir-logo.png" alt="HEIR" width="280">

  **Build, deploy, and run modular elements inside the HEIR workspace**

  [![SDK Version](https://img.shields.io/badge/SDK-1.0.0-0A0E1A?style=for-the-badge&labelColor=0A0E1A&color=CFB53B)](https://www.npmjs.com/package/@defai/element-sdk)
  [![CLI Version](https://img.shields.io/badge/CLI-1.0.0-0A0E1A?style=for-the-badge&labelColor=0A0E1A&color=CFB53B)](https://www.npmjs.com/package/@defai/element-cli)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
  [![Org](https://img.shields.io/badge/GitHub-heirlabs%2Felement--sdk-CFB53B?style=for-the-badge&labelColor=0A0E1A)](https://github.com/heirlabs/element-sdk)
</div>

---

## Brand

| | |
|---|---|
| **Product** | HEIR Elements |
| **Org** | [heirlabs](https://github.com/heirlabs) |
| **Repo** | [heirlabs/element-sdk](https://github.com/heirlabs/element-sdk) |
| **Brand color** | `#0A0E1A` |
| **Accent** | `#CFB53B` |
| **Site** | [heir.es](https://heir.es) |

> **Note on package names:** Published npm packages still use the historical `@defai/*` scope and `defai-element` CLI binary. The product brand is **HEIR**. Scope rename is tracked separately; install commands below match what is published today.

---

## Why build HEIR Elements?

HEIR Elements are modular, sandboxed components that run inside the HEIR Legacy Desk / workspace surface. Use the SDK to ship tools users can pin, run, and (where enabled) list on the marketplace.

- **Rapid scaffolding** — CLI templates and a sample workspace
- **Secure sandbox** — permissioned APIs (storage, wallet, network, AI)
- **React-first** — hooks and components for modern UI
- **Workspace APIs** — wallet, storage, messaging, market data, notifications
- **Publish path** — validate and publish through the CLI when marketplace is configured

---

## Quick start

### 1. Install the CLI

```bash
# Homebrew (if available for your platform)
brew install defai

# or npm
npm install -g @defai/element-cli
```

### 2. Sample workspace

```bash
cd sample-workspace-template
npm install
npm run dev
```

Opens a local demo workspace (default http://localhost:3000) with portfolio, trading, and inter-element messaging examples.

### 3. Create an element

```bash
defai-element create my-trading-bot --template react
cd my-trading-bot
npm install
defai-element dev
```

### 4. Build and validate

```bash
npm run build
npm run validate
# Publish when marketplace credentials are configured:
# npm run publish --tier bronze --price 100
```

---

## Installation

### Prerequisites

- Node.js 16+ and npm or yarn
- Familiarity with React / TypeScript
- Wallet access only if you publish or call wallet APIs

### Monorepo (this repository)

```bash
git clone https://github.com/heirlabs/element-sdk.git
cd element-sdk
npm install
npm run build
```

### Packages for your element project

```bash
# Core
npm install @defai/element-sdk @defai/element-react @defai/element-types

# Tools
npm install -g @defai/element-cli
npm install @defai/element-templates @defai/element-testing
npm install @defai/element-validator
```

Verify:

```bash
defai-element --version
```

---

## Architecture

Elements run in an isolated sandbox inside the HEIR workspace. They declare metadata and permissions, then use host APIs for wallet, AI, storage, messaging, and notifications.

### Element lifecycle

```typescript
import { DefaiElement } from '@defai/element-sdk';

export default class MyElement extends DefaiElement {
  readonly metadata = {
    id: 'my-element',
    name: 'My Awesome Element',
    version: '1.0.0',
    description: 'Does amazing things',
    category: 'Trading',
  };

  readonly permissions = {
    storage: true,
    wallet: true,
    ai: true,
    network: true,
  };

  async onMount(context) {
    this.api = context.api;
  }

  async onUnmount() {
    // cleanup
  }

  render() {
    return <div>Hello HEIR</div>;
  }
}
```

### Host APIs

| API | Purpose |
|-----|---------|
| **Wallet** | Balances, signing, transaction permission |
| **AI** | Chat, analysis, generation (when configured) |
| **Storage** | Encrypted key-value persistence |
| **Messaging** | Inter-element pub/sub |
| **Market data** | Price feeds (when configured) |
| **Notifications** | User alerts and confirms |

---

## Sample workspace template

```bash
cd sample-workspace-template
npm install
npm run dev
npm run build
npm run test
npm run validate
```

Includes portfolio, AI analysis hooks, trading UI patterns, and real-time messaging between elements.

```
sample-workspace-template/
├── src/
│   ├── index.tsx
│   └── components/
├── public/
│   └── index.html
├── webpack.config.js
├── package.json
└── README.md
```

Customize by forking the template, editing metadata / components, then:

```bash
npm run build
npm run validate
defai-element publish --tier bronze
```

---

## Advanced usage

### Messaging

```typescript
this.api.messaging.subscribe('price-alerts', (alert) => {
  if (alert.symbol === this.state.watchedSymbol) {
    this.showNotification(alert.message);
  }
});

this.api.messaging.broadcast('trade-executed', {
  symbol: 'SOL-USD',
  amount: 100,
  price: 45.67,
  timestamp: Date.now(),
});
```

### AI

```typescript
const sentiment = await this.api.ai.analyze('market-sentiment', {
  symbols: ['SOL-USD', 'BTC-USD'],
  timeframe: '1h',
  includeNews: true,
});

const insights = await this.api.ai.generate(
  'Summarize the SOL price movement in three bullets'
);
```

### Wallet

```typescript
const solBalance = await this.api.wallet.getBalance('SOL');
const permitted = await this.api.wallet.requestPermission('transaction');
if (permitted) {
  const txHash = await this.api.wallet.sendTransaction({
    type: 'swap',
    from: 'SOL',
    to: 'USDC',
    amount: 10,
  });
}
```

### Storage

```typescript
await this.api.storage.set('user-preferences', {
  theme: 'dark',
  defaultSlippage: 0.5,
});
const portfolio = await this.api.storage.get('user-portfolio');
```

---

## Testing and validation

```bash
npm run test -- --coverage
defai-element validate
defai-element validate --strict
defai-element audit
defai-element analyze --bundle-size
```

```typescript
import { mockElementAPI } from '@defai/element-testing';

describe('MyElement', () => {
  beforeEach(() => {
    mockElementAPI({
      wallet: {
        getBalance: jest.fn(() => Promise.resolve(1000)),
      },
    });
  });
});
```

---

## Publishing

```bash
npm run build
npm run validate --strict

defai-element publish \
  --tier bronze \
  --price 150 \
  --royalty 10 \
  --description "Workspace element for HEIR"

defai-element update --version patch
```

Marketplace models (when enabled): one-time purchase, subscription, usage-based, freemium, multi-tier.

---

## CI sketch

```yaml
name: Element CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install -g @defai/element-cli
      - run: npm ci
      - run: defai-element test --coverage
      - run: defai-element validate --strict
      - run: defai-element build
```

---

## Contributing

```bash
git clone https://github.com/heirlabs/element-sdk.git
cd element-sdk
npm install
npm run build
npm run test
```

1. Fork and branch from `main`
2. Keep lint/format clean
3. Add tests for behavior changes
4. Open a PR against [heirlabs/element-sdk](https://github.com/heirlabs/element-sdk)

Helpful areas: bug fixes, docs, tests, templates, sandbox APIs.

---

## Support

| | |
|---|---|
| **Product** | [heir.es](https://heir.es) |
| **Issues** | [heirlabs/element-sdk/issues](https://github.com/heirlabs/element-sdk/issues) |
| **Email** | developers@heir.es |

---

## License

MIT — see [LICENSE](LICENSE).

---

**Build for the HEIR workspace.** Start from the sample template, validate with the CLI, and open issues on [heirlabs/element-sdk](https://github.com/heirlabs/element-sdk).
