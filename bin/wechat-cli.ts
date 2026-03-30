#!/usr/bin/env node

import { createCli } from '../src/cli.js';
import { handleError } from '../src/core/error.js';

const program = createCli();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  handleError(err);
}
