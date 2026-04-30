---
name: create-video-backend-architecture
description: Core guide for AION backend. Focused on video processing for modern and legacy (Chrome 26/Smart TV 2014) environments using Bun, Express, and FFmpeg.
---

# AION Backend Architecture Guide

## Core Principles

- **Runtime**: **Bun** (Strict: Use `bun install`, `bun add`, `bun run`).
- **Framework**: Express with TypeScript and ES Modules.
- **Security**: JWT-based Authentication via Passport.js.
- **Validation**: Zod for all request/response schemas.
- **Output Standard**: All video services MUST transcode incoming formats (HLS/DASH) to **MP4 (Codec: H.264)**.

## Versioned Folder Structure

```text
src/
├── config/                # Environment variables and Passport strategies
├── index.ts               # Entry point
├── router/                # Centralized Routing
│   ├── index.ts           # Prefix: /api
│   └── v1/                # Version 1 Router (Prefix: /v1)
│       ├── index.ts       
│       └── routes/        # auth.routes.ts, stream.routes.ts
├── modules/               # Domain logic (Auth, Platforms like CrunchyRoll)
├── services/              # Shared business logic
│   ├── TranscoderService/ # FFmpeg core logic
│   └── IntegrationService/# Base class for platform adapters
└── utils/                 # Shared helpers