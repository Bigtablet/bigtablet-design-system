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

// ── Custom error ─────────────────────────────────────────────────────────────

export class FigmaApiError extends Error {
    constructor(
        message: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = "FigmaApiError";
    }
}

// ── Env loader ───────────────────────────────────────────────────────────────

export function loadEnv(): void {
    const envPath = resolve(process.cwd(), ".env");
    if (!existsSync(envPath)) return;

    let lines: string[];
    try {
        lines = readFileSync(envPath, "utf-8").split("\n");
    } catch (err) {
        console.warn(`⚠️  .env 파일을 읽을 수 없습니다: ${(err as Error).message}`);
        return;
    }

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

const API_TIMEOUT_MS = 30_000;

export async function figmaFetch<T = unknown>(
    path: string,
    token: string
): Promise<T> {
    const url = `https://api.figma.com${path}`;
    let res: Response;

    try {
        res = await fetch(url, {
            headers: { "X-Figma-Token": token },
            signal: AbortSignal.timeout(API_TIMEOUT_MS),
        });
    } catch (err) {
        const cause = err as Error;
        if (cause.name === "TimeoutError") {
            throw new FigmaApiError(
                `Figma API 요청 타임아웃 (${API_TIMEOUT_MS / 1000}s 초과): ${path}`
            );
        }
        throw new FigmaApiError(
            `Figma API 네트워크 오류: ${cause.message} (인터넷 연결을 확인해주세요)`
        );
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string };
        throw new FigmaApiError(
            `Figma API ${res.status} ${res.statusText}: ${body.message ?? "알 수 없는 오류"}`,
            res.status
        );
    }

    try {
        return await res.json() as T;
    } catch {
        throw new FigmaApiError(`Figma API 응답을 파싱할 수 없습니다 (경로: ${path})`);
    }
}

// ── Safe JSON parse ───────────────────────────────────────────────────────────

export function parseJsonFile<T>(filePath: string, label: string): T {
    let raw: string;
    try {
        raw = readFileSync(filePath, "utf-8");
    } catch (err) {
        throw new Error(`${label} 파일을 읽을 수 없습니다: ${(err as Error).message}`);
    }

    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new Error(
            `${label} 파일이 올바른 JSON 형식이 아닙니다. 파일이 손상되었을 수 있습니다: ${filePath}`
        );
    }
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
