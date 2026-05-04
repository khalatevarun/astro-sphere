---
title: "react-filejump"
summary: "Alt+Click any element in your React app to jump directly to its source file in your editor"
date: "04 Feb 2026"
draft: false
tags:
  - react
  - devtools

repoUrl: https://github.com/khalatevarun/react-filejump
---

## Overview

react-filejump is a developer tool that lets you navigate from any rendered element in the browser directly to the source file that produced it — no more hunting through folders.

- **Alt+Click** any element → opens the component's source file in your editor
- **Alt+Shift+Click** → jumps to where the component is being used (parent)
- Works with React 16.8+ and any major editor (VS Code, Cursor, WebStorm, IntelliJ, Sublime, Vim, etc.)

## How It Works

1. Import the library once at the top of your app entry file
2. Run `npx filejump-server` in a separate terminal
3. The server auto-detects your running editor and opens files on demand

The library instruments React's fiber tree (via [bippy](https://github.com/aidenybai/bippy)) to extract the exact source location of the component that rendered any clicked DOM element. The local server then calls `launch-editor` to open the file at the right line.

## Install

```bash
npm install react-filejump
```

```tsx
// main.tsx — import before React renders
import "react-filejump";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

```bash
# separate terminal
npx filejump-server
```

## Tech Stack

- **TypeScript** — library + server
- **bippy** — React fiber instrumentation
- **launch-editor** — cross-editor file opening
- **tsup** — ESM/CJS/IIFE builds
