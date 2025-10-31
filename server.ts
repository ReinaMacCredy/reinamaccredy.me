import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { networkInterfaces, NetworkInterfaceInfo } from 'os';

let PORT = 3000;
const DIST_DIR = './out';

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m'
} as const;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getNetworkAddress(): string {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaces = interfaces[name];
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function formatTimestamp(): string {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  return `${date} ${time}`;
}

function getMimeType(filepath: string): string {
  const ext = extname(filepath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function printServerBox(): void {
  const localUrl = `http://localhost:${PORT}`;
  const networkUrl = `http://${getNetworkAddress()}:${PORT}`;

  const lines = [
    '',
    '   Serving!',
    '',
    `   - Local:    ${localUrl}`,
    `   - Network:  ${networkUrl}`,
    '',
    '   Copied local address to clipboard!',
    ''
  ];

  const maxLength = Math.max(...lines.map(l => l.length));
  const border = '─'.repeat(maxLength + 4);

  console.log(`${COLORS.cyan}\n   ┌${border}┐${COLORS.reset}`);
  lines.forEach(line => {
    const padding = ' '.repeat(maxLength - line.length);
    console.log(`${COLORS.cyan}   │${COLORS.reset}  ${line}${padding}  ${COLORS.cyan}│${COLORS.reset}`);
  });
  console.log(`${COLORS.cyan}   └${border}┘${COLORS.reset}\n`);

  try {
    if (process.platform === 'darwin') {
      Bun.spawn(['pbcopy'], {
        stdin: 'pipe',
        stdout: 'inherit'
      }).stdin.write(localUrl);
      Bun.spawn(['pbcopy'], { stdin: 'pipe' }).stdin.end(localUrl);
    }
  } catch (e) {
    // Ignore clipboard errors
  }
}

async function findAvailablePort(startPort = 3000, maxAttempts = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    try {
      const testServer = Bun.serve({
        port,
        fetch() {
          return new Response('test');
        }
      });
      testServer.stop();
      return port;
    } catch (e) {
      continue;
    }
  }
  throw new Error(`Could not find available port between ${startPort} and ${startPort + maxAttempts - 1}`);
}

PORT = await findAvailablePort(3000);

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const start = Date.now();
    const url = new URL(req.url);
    let pathname = url.pathname;

    const ip = req.headers.get('x-forwarded-for') || 'localhost';
    const method = req.method;

    if (pathname === '/') pathname = '/index.html';

    const filepath = join(DIST_DIR, pathname.split('?')[0]);

    try {
      const file = Bun.file(filepath);
      const exists = await file.exists();

      if (!exists) {
        const duration = Date.now() - start;
        console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${COLORS.red}${method}${COLORS.reset} ${pathname}`);
        console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${COLORS.red}Returned 404${COLORS.reset} in ${duration} ms`);
        return new Response('Not Found', { status: 404 });
      }

      console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${method} ${pathname}`);

      const content = await file.arrayBuffer();
      const duration = Date.now() - start;

      console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${COLORS.green}Returned 200${COLORS.reset} in ${duration} ms`);

      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': getMimeType(filepath),
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      const duration = Date.now() - start;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${COLORS.red}${method}${COLORS.reset} ${pathname}`);
      console.log(`${COLORS.purple} HTTP ${COLORS.reset} ${formatTimestamp()} ${COLORS.gray}${ip}${COLORS.reset} ${COLORS.red}Error${COLORS.reset} ${errorMessage}`);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
});

printServerBox();

