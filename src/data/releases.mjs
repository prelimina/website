// Public projection of the authoritative desktop manifest, validated by source
// automation before synchronization. Private qualification evidence stays there.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const hashPattern = /^[0-9a-f]{64}$/;
const digest = text => createHash('sha256').update(text).digest('hex');
const base = 'https://github.com/prelimina/desktop/releases/';

export function compareVersions(a, b) {
  if (!versionPattern.test(a) || !versionPattern.test(b)) throw new Error('Invalid release version');
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
}

export function validateRelease(release, notes) {
  if (!release || release.schemaVersion !== 1 || !versionPattern.test(release.version) ||
      !Number.isSafeInteger(release.releaseId) || release.releaseId <= 0 ||
      !hashPattern.test(release.notesSha256) || digest(notes) !== release.notesSha256 ||
      !hashPattern.test(release.manifestSha256) ||
      release.manifestUrl !== `${base}download/v${release.version}/download-manifest.json` ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(release.publishedAt) ||
      !Number.isFinite(Date.parse(release.publishedAt))) throw new Error('Invalid verified release identity');
  if (notes.length < 60 || Buffer.byteLength(notes) > 16000 || !notes.startsWith(`# Prelimina ${release.version}\n`) ||
      /[<>\x00-\x08\x0b\x0c\x0e-\x1f]|```|~~~|!\[|\]\s*\(|https?:|www\.|j8asic|SlangSolvers|github_pat_|gh[pousr]_/i.test(notes))
    throw new Error('Release notes must be bounded inert public text');
  if (!Array.isArray(release.downloads) || release.downloads.length !== 2 ||
      new Set(release.downloads.map(d => d.channel)).size !== 2) throw new Error('Both platform downloads are required');
  for (const download of release.downloads) {
    const extension = download.channel === 'win-x64' ? '-Setup.exe' : download.channel === 'linux-x64' ? '.AppImage' : null;
    if (!extension || download.installerUrl !== `${base}download/v${release.version}/Prelimina-${release.version}-${download.channel}${extension}` ||
        !hashPattern.test(download.sha256) || !Number.isSafeInteger(download.bytes) || download.bytes <= 0 ||
        download.signing !== 'unsigned' || !Array.isArray(download.requirements) ||
        download.requirements.some(r => typeof r !== 'string' || r.length > 1000 || /[<>]|https?:|j8asic|SlangSolvers/i.test(r)))
      throw new Error('Invalid platform download metadata');
  }
  if (/j8asic|SlangSolvers|github_pat_|gh[pousr]_/.test(JSON.stringify(release))) throw new Error('Private release evidence is not website content');
  return { ...release, notes };
}

export function validateCatalogue(current, releases) {
  if (current === null) {
    if (releases.length) throw new Error('Release catalogue lacks its selected release');
    return { current: null, releases: [] };
  }
  const sorted = [...releases].sort((a, b) => compareVersions(b.version, a.version));
  if (new Set(sorted.map(r => r.version)).size !== sorted.length) throw new Error('Duplicate release version');
  const selected = sorted[0];
  if (!selected || current.version !== selected.version || current.releaseId !== selected.releaseId ||
      current.notesSha256 !== selected.notesSha256) throw new Error('Selected release is stale or has a different identity');
  return { current: selected, releases: sorted };
}

export function loadCatalogue(root = process.cwd()) {
  const current = JSON.parse(readFileSync(join(root, 'src/data/current-release.json'), 'utf8'));
  const directory = join(root, 'src/data/releases');
  const releases = (existsSync(directory) ? readdirSync(directory) : []).filter(f => f.endsWith('.json')).map(file => {
    const release = JSON.parse(readFileSync(join(directory, file), 'utf8'));
    if (!versionPattern.test(release.version) || file !== `${release.version}.json`) throw new Error('Release filename mismatch');
    return validateRelease(release, readFileSync(join(root, `src/content/releases/${release.version}.md`), 'utf8'));
  });
  return validateCatalogue(current, releases);
}
