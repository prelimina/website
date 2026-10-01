import { loadCatalogue } from '../data/releases.mjs';
export function GET() {
  const { current } = loadCatalogue();
  return new Response(JSON.stringify({ schemaVersion: 1, release: current ? {
    version: current.version, releaseId: current.releaseId, notesSha256: current.notesSha256,
  } : null }) + '\n', { headers: { 'Content-Type': 'application/json' } });
}
