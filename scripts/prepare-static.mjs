import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }));
  return files.flat();
}

async function validateReference(filename, reference, { module = false } = {}) {
  const label = path.relative(output, filename);
  if (reference.startsWith('#') || reference.startsWith('data:')) return;
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) {
    throw new Error(`${label}: external dependency is not allowed: ${reference}`);
  }
  if (module && !reference.startsWith('.') && !reference.startsWith('/')) {
    throw new Error(`${label}: module must use a local path: ${reference}`);
  }
  const localPath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (!localPath) return;
  const target = localPath.startsWith('/')
    ? path.resolve(output, `.${localPath}`)
    : path.resolve(path.dirname(filename), localPath);
  const relative = path.relative(output, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label}: reference leaves the static package: ${reference}`);
  }
  try {
    const targetStat = await stat(target);
    if (targetStat.isDirectory()) await stat(path.join(target, 'index.html'));
  } catch {
    throw new Error(`${label}: missing packaged file: ${reference}`);
  }
}

async function validateFile(filename) {
  const extension = path.extname(filename);
  if (!['.html', '.css', '.js', '.mjs'].includes(extension)) return;
  const source = await readFile(filename, 'utf8');
  const references = [];
  if (extension === '.html') {
    for (const match of source.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)) {
      references.push([match[2], {}]);
    }
  } else if (extension === '.css') {
    for (const match of source.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
      references.push([match[2].trim(), {}]);
    }
    for (const match of source.matchAll(/@import\s+(["'])(.*?)\1/gi)) {
      references.push([match[2], {}]);
    }
  } else {
    for (const match of source.matchAll(/\b(?:import|export)\s+(?:[^;"']*?\s+from\s*)?(["'])(.*?)\1/g)) {
      references.push([match[2], { module: true }]);
    }
  }
  for (const [reference, options] of references) {
    await validateReference(filename, reference, options);
  }
}

try {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const name of ['index.html', 'src']) {
    await cp(path.join(root, name), path.join(output, name), { recursive: true });
  }
  try {
    await stat(path.join(root, 'assets'));
    await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const files = await filesIn(output);
  for (const filename of files) await validateFile(filename);
  console.log(`Static package ready: dist/ (${files.length} files; local references verified).`);
} catch (error) {
  await rm(output, { recursive: true, force: true });
  console.error(`Static packaging failed: ${error.message}`);
  process.exitCode = 1;
}
