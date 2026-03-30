import { describe, it, expect, vi, beforeEach } from 'vitest';
import { output } from '../../src/core/output.js';

describe('output', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  it('should output JSON format', () => {
    const data = { key: 'value', num: 42 };
    output(data, { format: 'json' });

    expect(process.stdout.write).toHaveBeenCalledWith(
      JSON.stringify(data, null, 2) + '\n',
    );
  });

  it('should output CSV format for array data', () => {
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];
    output(data, { format: 'csv' });

    const written = (process.stdout.write as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(written).toContain('name,age');
    expect(written).toContain('Alice,30');
    expect(written).toContain('Bob,25');
  });

  it('should handle CSV escaping', () => {
    const data = [{ text: 'hello, "world"' }];
    output(data, { format: 'csv' });

    const written = (process.stdout.write as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(written).toContain('"hello, ""world"""');
  });
});
