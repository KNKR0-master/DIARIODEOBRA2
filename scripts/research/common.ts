import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const rootDir = process.cwd();
export const outputDir = path.join(rootDir, "research", "output");

export async function ensureOutputDir() {
  await mkdir(outputDir, { recursive: true });
}

export function getTargetUrl() {
  return process.env.BENCHMARK_TARGET_URL ?? process.argv[2] ?? "";
}

export async function writeJson(filename: string, data: unknown) {
  await ensureOutputDir();
  await writeFile(path.join(outputDir, filename), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function writeMarkdown(filename: string, content: string) {
  await ensureOutputDir();
  await writeFile(path.join(outputDir, filename), content, "utf8");
}

export async function readProjectDoc(filename: string) {
  return readFile(path.join(rootDir, filename), "utf8");
}

export function nowIso() {
  return new Date().toISOString();
}

