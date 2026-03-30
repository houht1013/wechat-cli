export type OutputFormat = 'json' | 'pretty' | 'table' | 'csv';

export interface GlobalOptions {
  format: OutputFormat;
  output?: string;
  quiet: boolean;
  verbose: boolean;
  config?: string;
}
