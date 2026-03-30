import chalk from 'chalk';
import Table from 'cli-table3';
import { writeFileSync } from 'node:fs';
import type { OutputFormat } from '../types/common.js';

export interface OutputOptions {
  format: OutputFormat;
  outputFile?: string;
  quiet?: boolean;
}

export function output(data: unknown, options: OutputOptions): void {
  const text = formatData(data, options.format);

  if (options.outputFile) {
    writeFileSync(options.outputFile, text, 'utf-8');
    if (!options.quiet) {
      process.stderr.write(`Output written to ${options.outputFile}\n`);
    }
  } else {
    process.stdout.write(text + '\n');
  }
}

function formatData(data: unknown, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'pretty':
      return formatPretty(data);
    case 'table':
      return formatTable(data);
    case 'csv':
      return formatCsv(data);
    default:
      return JSON.stringify(data, null, 2);
  }
}

function formatPretty(data: unknown): string {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return String(data);

  if (Array.isArray(data)) {
    return data.map((item, i) => `${chalk.cyan(`[${i}]`)} ${formatPrettyObject(item)}`).join('\n\n');
  }

  return formatPrettyObject(data);
}

function formatPrettyObject(obj: unknown): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);

  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === 'object' && value !== null) {
      lines.push(`${chalk.bold(key)}:`);
      lines.push(`  ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`);
    } else {
      lines.push(`${chalk.bold(key)}: ${String(value)}`);
    }
  }
  return lines.join('\n');
}

function formatTable(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    if (typeof data === 'object' && data !== null) {
      const table = new Table();
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        table.push({ [chalk.bold(key)]: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '') });
      }
      return table.toString();
    }
    return String(data);
  }

  const keys = Object.keys(data[0] as Record<string, unknown>);
  const table = new Table({
    head: keys.map(k => chalk.bold(k)),
  });

  for (const item of data) {
    const row = keys.map(k => {
      const val = (item as Record<string, unknown>)[k];
      return typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
    });
    table.push(row);
  }

  return table.toString();
}

function formatCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return JSON.stringify(data);
  }

  const keys = Object.keys(data[0] as Record<string, unknown>);
  const header = keys.map(escapeCsv).join(',');
  const rows = data.map(item => {
    return keys.map(k => {
      const val = (item as Record<string, unknown>)[k];
      return escapeCsv(typeof val === 'object' ? JSON.stringify(val) : String(val ?? ''));
    }).join(',');
  });

  return [header, ...rows].join('\n');
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Print a message to stderr (for human-readable info, not data) */
export function info(msg: string, quiet?: boolean): void {
  if (!quiet) {
    process.stderr.write(msg + '\n');
  }
}

export function success(msg: string, quiet?: boolean): void {
  if (!quiet) {
    process.stderr.write(chalk.green('✓ ') + msg + '\n');
  }
}

export function warn(msg: string, quiet?: boolean): void {
  if (!quiet) {
    process.stderr.write(chalk.yellow('⚠ ') + msg + '\n');
  }
}
