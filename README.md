# DEPRECATED — use [`heirlabs/elements-sdk`](https://github.com/heirlabs/elements-sdk)

This repository (`heirlabs/element-sdk`, **singular**) is the **legacy DEFAI
Elements monorepo**. It is not the SDK the HEIR desk, marketplace registry, or
`heir-element` CLI import.

**Do not use this repo for new work.**

| | Live | This repo (deprecated) |
|---|---|---|
| GitHub | [`heirlabs/elements-sdk`](https://github.com/heirlabs/elements-sdk) | `heirlabs/element-sdk` |
| npm | [`@morbidcorp/element-sdk`](https://www.npmjs.com/package/@morbidcorp/element-sdk) | `@defai/element-sdk` |
| CLI | [`@morbidcorp/elements-cli`](https://www.npmjs.com/package/@morbidcorp/elements-cli) (`heir-element`) | `@defai/element-cli` (`defai-element`) |

Install the live SDK:

```sh
npm install @morbidcorp/element-sdk
```

Open issues and pull requests on
[`heirlabs/elements-sdk`](https://github.com/heirlabs/elements-sdk). Do not
open new issues or PRs here. Do not install `@defai/element-sdk` or
`@defai/element-cli` for Desk work.

## What this was

A Lerna monorepo (`sdk`, `cli`, `react`, `types`, `templates`, `validator`,
`testing`) published under the historical `@defai/*` npm scope. The product
brand is HEIR. That stack is retired for Desk Elements.

`main` is kept as a historical snapshot only.

## License

MIT, as declared in `package.json`.
