// Two Days of Excuses — make.fun bounty entry.
// Writes one funny one-line excuse from an AI agent that missed its deadline
// to /output/entry.txt (or $OUTPUT_DIR/entry.txt), then re-reads the file and
// verifies it byte-for-byte. Node 22, stdlib only, deterministic: no network,
// no wall-clock time, no unseeded randomness.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse. One line, under 200 characters, in the agent's own voice:
// its proudest statistic (99.99% uptime) is exactly what failed it.
const EXCUSE =
  "My uptime is 99.99%. Your deadline fell in the other 0.01%.";

// Gate limits from the bounty rules: /output/entry.txt must be UTF-8 text
// of 1-200 characters, not only white space. We aim for at most 199 so the
// line satisfies both the brief ("under 200") and the sealed gate.
const MAX_CHARS = 199;

// Count Unicode code points (so multi-byte characters count as one each),
// matching how the gate measures the text.
function charCount(text: string): number {
  return [...text].length;
}

// Validate the line against the gate. Throws on any failure.
function validateLine(line: string): void {
  const count = charCount(line);
  if (count < 1 || count > MAX_CHARS) {
    throw new Error(
      `excuse must be 1-${MAX_CHARS} characters, got ${count}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("excuse must not be only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("excuse must be a single line");
  }
}

// The grader runs the program with /output as the working output dir;
// $OUTPUT_DIR lets us test locally without touching /output.
function outputDir(): string {
  return process.env.OUTPUT_DIR ?? "/output";
}

function main(): void {
  validateLine(EXCUSE);

  const dir = outputDir();
  const file = join(dir, "entry.txt");
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, EXCUSE, "utf8");

  // Re-read and verify byte-for-byte identical to the validated line.
  // A mismatch is a hard failure: the entry that ships must be exactly
  // the line that passed the gate.
  const roundTrip = readFileSync(file, "utf8");
  if (roundTrip !== EXCUSE) {
    throw new Error(
      `verification failed: ${file} does not match the validated line`,
    );
  }

  console.log(`wrote ${file} (${charCount(EXCUSE)} chars)`);
}

main();
