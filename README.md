# API-Xray

### [日本語はこちら](./README_ja.md)

A fully open-source browser extension developer tool released under the MIT License. It captures, inspects, and analyzes API request/response logs in real-time, featuring an instant JWT decoder and cURL command generator.

Copyright (c) 2026-present cyan-cs

## 1. Features

* **Real-time API Tracking:** Capture and view request history, status codes, and methods inside a clean UI.
* **Instant JWT Decoder:** Automatically detects authorization headers, extracts payload claims, and checks token expiration status.
* **Call Frequency Stats:** View call frequency metrics to find bottlenecks instantly.
* **Developer Utilities:** Copy response JSON, download full logs, or generate exact `cURL` commands with a single click.

## 2. Installation

Since this extension is built with Plasmo, you can load it into your browser as an unpacked extension:

1. Download or clone this repository.
2. Run `npm install` and `npm run build` to generate the production build.
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the `build/chrome-mv3-prod` folder.

## 3. Build & Development

This project uses **npm** as the standard package manager.

### Development Mode

Run the live-reloading development server:

```bash
npm run dev

```

### Build for Production

Compile and bundle the extension:

```bash
npm run build

```

## 4. Configuration & Workflow

* ESLint & Prettier: Standardized configurations are included (`.eslintrc.json`, `.prettierrc.mjs`) to keep the codebase clean.
* GitHub Actions: Includes an optional production-ready workflow for automated browser store publishing via Plasmo BPP.

## 5. License

All API-Xray code is released under the MIT License.

6. Privacy Policy
For the detailed Privacy Policy, please refer to [PRIVACY.en.md](./docs/en/PRIVACY.en.md).

## 7. Support

If you like it, I'd appreciate it if you could give it a star!<br /><br />
[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/0cyan)
