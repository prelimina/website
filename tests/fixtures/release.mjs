import { createHash } from 'node:crypto';
export function releaseFixture(version = '0.1.0') {
  const notes = `# Prelimina ${version}\n\nIncludes bug fixes.\n\nThese binaries are unsigned. A Vulkan-capable GPU and vendor driver are required. CUDA and macOS packages are not included. Back up projects and keep them outside the installation directory.\n`;
  return { notes, data: { schemaVersion: 1, version, releaseId: 456, publishedAt: '2026-09-30T08:00:00Z',
    notesSha256: createHash('sha256').update(notes).digest('hex'), manifestSha256: 'a'.repeat(64),
    manifestUrl: `https://github.com/prelimina/desktop/releases/download/v${version}/download-manifest.json`,
    downloads: ['win-x64', 'linux-x64'].map(channel => ({channel, signing: 'unsigned', bytes: 123, sha256: 'b'.repeat(64),
      requirements: ['Vulkan-capable GPU and vendor driver'],
      installerUrl: `https://github.com/prelimina/desktop/releases/download/v${version}/Prelimina-${version}-${channel}${channel === 'win-x64' ? '-Setup.exe' : '.AppImage'}`})) } };
}
