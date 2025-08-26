'use client';
import styles from './codeView.module.css';

interface CodeViewProps {
  rulesState: string;
  error: string;
  selectedPath: string;
}

const DEBUG = true;

export default function CodeView({
  rulesState,
  error,
  selectedPath,
}: CodeViewProps) {

  return (
    <div className={styles.codeBlock}>
      {error && <p className={styles.error}>{error}</p>}
      <pre className={styles.pre}>
        {(() => {
          const lines = rulesState.split('\n');

          const selectedParts = normalizePath(selectedPath);

          let highlightStart = -1;
          let highlightEnd = -1;

          let inDocuments = false;
          let depth = 0;                 // brace depth inside /documents
          let targetDepth = -1;          // interior depth of the chosen match block
          const pathAtDepth: Record<number, string[]> = {};

          for (let i = 0; i < lines.length; i++) {
            const raw = lines[i];
            const line = raw.trim();

            // Enter documents block
            if (!inDocuments && /^match\s+\/databases\/\{database\}\/documents\s*\{/.test(line)) {
              inDocuments = true;
              depth = 1;
              pathAtDepth[1] = [];
              continue;
            }
            if (!inDocuments) continue;

            // Try to parse a match path on this line (robust to wildcards)
            const matchSegments = parseMatchSegments(raw);
            const isMatchLine = !!matchSegments;

            // If we’re highlighting and we hit a sibling match (same parent depth),
            // end the highlight BEFORE changing depth.
            if (
              highlightStart !== -1 &&
              isMatchLine &&
              depth === (targetDepth - 1) &&
              i > highlightStart
            ) {
              highlightEnd = i - 1;
              break;
            }

            if (isMatchLine) {
              const segs = normalizeSegments(matchSegments!);
              const parentPath = pathAtDepth[depth] || [];
              const currentPath = [...parentPath, ...segs];
              pathAtDepth[depth + 1] = currentPath; // ledger: interior depth of this block

              if (pathsEqual(currentPath, selectedParts)) {
                highlightStart = i;
                targetDepth = depth + 1;
              }
            }

            // Count braces on this line
            const opens = (line.match(/\{/g) || []).length;
            const closes = (line.match(/\}/g) || []).length;

            const prevDepth = depth;
            depth += opens - closes;

            // If we were inside the selected block and this line closes it, include this line
            if (highlightStart !== -1 && prevDepth === targetDepth && closes > 0 && opens === 0) {
              highlightEnd = i;
              break;
            }

            // Leaving /documents (safety)
            if (depth <= 0) {
              inDocuments = false;
              if (highlightStart !== -1 && highlightEnd === -1) {
                highlightEnd = i;
              }
              break;
            }
          }

          if (highlightStart !== -1 && highlightEnd === -1) {
            highlightEnd = lines.length - 1;
          }

          return lines.map((line, i) => {
            const isHighlighted =
              highlightStart !== -1 &&
              highlightEnd !== -1 &&
              i >= highlightStart &&
              i <= highlightEnd;

            const displayLine = line.trim() === '' ? '\u00A0' : line;

            return (
              <div
                key={i}
                className={isHighlighted ? styles.highlight : ''}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {displayLine}
              </div>
            );
          });
        })()}
      </pre>
    </div>
  );
}

/** Get the path portion of a `match /... {` line, allowing wildcards. */
const parseMatchSegments = (rawLine: string): string[] | null => {
  // Find the *block* opening brace (the last '{' on the line)
  const brace = rawLine.lastIndexOf('{');
  if (brace === -1) return null;
  const before = rawLine.slice(0, brace);

  const m = before.match(/^\s*match\s+\/?(.*)\s*$/);
  if (!m) return null;

  const path = m[1].trim().replace(/^\//, '');
  if (!path) return [];
  return path.split('/').filter(Boolean);
}

/** Normalize whole path (dropdown or extracted) to segments without braces. */
const normalizePath = (path: string): string[] => {
  return path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^databases\/\{database\}\/documents\/?/, '')
    .replace(/^databases\//, '')
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)
    .map(seg => seg.replace(/^{|}$/g, ''));
}

/** Normalize already-split segments (from match line). */
const normalizeSegments = (segs: string[]): string[] => {
  return segs.map(s => s.replace(/^{|}$/g, ''));
}

const pathsEqual = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
