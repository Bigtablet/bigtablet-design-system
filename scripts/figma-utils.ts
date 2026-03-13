/**
 * figma-utils.ts — Shared utilities for Figma scripts
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FigmaColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export interface FigmaFill {
    type: string;
    color?: FigmaColor;
    opacity?: number;
}

export interface FigmaStyleMeta {
    key: string;
    name: string;
    styleType: "FILL" | "TEXT" | "EFFECT" | "GRID";
}

export interface FigmaNodeDocument {
    fills?: FigmaFill[];
}

export interface ColorEntry {
    nodeId: string;
    key: string;
    value: string | null;
}

export interface ColorSnapshot {
    version: string;
    lastModified: string;
    colors: Record<string, ColorEntry>;
}

// ── Env loader ───────────────────────────────────────────────────────────────

export function loadEnv(): void {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) return;
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length && !process.env[key.trim()]) {
            process.env[key.trim()] = rest.join("=").trim();
        }
    }
}

// ── Figma API helper ─────────────────────────────────────────────────────────

export async function figmaFetch<T = unknown>(
    path: string,
    token: string
): Promise<T> {
    const res = await fetch(`https://api.figma.com${path}`, {
        headers: { "X-Figma-Token": token },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(`${res.status} ${res.statusText}: ${err.message ?? ""}`);
    }
    return res.json() as Promise<T>;
}

// ── Color conversion ─────────────────────────────────────────────────────────

export function rgbToValue(r: number, g: number, b: number, opacity: number): string {
    if (opacity < 1) {
        const ro = Math.round(opacity * 100) / 100;
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${ro})`;
    }
    return (
        "#" +
        [r, g, b]
            .map((v) => Math.round(v * 255).toString(16).padStart(2, "0"))
            .join("")
    );
}

// ── Fetch all color styles from a Figma file ─────────────────────────────────

export async function fetchColorStyles(
    fileKey: string,
    token: string
): Promise<ColorSnapshot> {
    const fileData = await figmaFetch<{
        version: string;
        lastModified: string;
        styles?: Record<string, FigmaStyleMeta>;
    }>(`/v1/files/${fileKey}`, token);

    const stylesMap = fileData.styles ?? {};
    const colorEntries = Object.entries(stylesMap).filter(
        ([, s]) => s.styleType === "FILL"
    );

    if (colorEntries.length === 0) {
        return { version: fileData.version, lastModified: fileData.lastModified, colors: {} };
    }

    const nodeIds = colorEntries.map(([id]) => id).join(",");
    const nodesData = await figmaFetch<{
        nodes?: Record<string, { document?: FigmaNodeDocument }>;
    }>(`/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeIds)}`, token);

    const colors: Record<string, ColorEntry> = {};
    for (const [nodeId, styleMeta] of colorEntries) {
        const doc = nodesData.nodes?.[nodeId]?.document;
        const fill = doc?.fills?.[0];

        let value: string | null = null;
        if (fill?.type === "SOLID" && fill.color) {
            const { r, g, b } = fill.color;
            value = rgbToValue(r, g, b, fill.opacity ?? 1);
        }

        colors[styleMeta.name] = { nodeId, key: styleMeta.key, value };
    }

    return { version: fileData.version, lastModified: fileData.lastModified, colors };
}
