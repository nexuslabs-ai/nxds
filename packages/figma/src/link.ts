// The local link between nxds-cli and the plugin. The plugin's UI iframe has
// a null origin, so every answer allows any origin. It GETs /capture, builds,
// and POSTs its report to /report, which resolves `report`.
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { AddressInfo } from 'node:net';

import { type BuildReport, REPORT_FORMAT } from './spec.ts';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-private-network': 'true',
};

const MAX_REPORT_BYTES = 64 * 1024 * 1024;

export interface Link {
  port: number;
  /** Resolves with the first report the plugin posts. */
  report: Promise<BuildReport>;
  close(): Promise<void>;
}

/** Thrown when another process already listens on the port. */
export class PortInUseError extends Error {}

const isReport = (value: unknown): value is BuildReport =>
  typeof value === 'object' &&
  value !== null &&
  (value as BuildReport).format === REPORT_FORMAT;

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_REPORT_BYTES) {
        reject(new Error('The report is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function listen(server: Server, port: number, host: string) {
  return new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

/** Serves `capture` on localhost at `port`, over IPv4 and IPv6, until the plugin posts a report. Port 0 picks a free port. */
export async function openLink(capture: string, port: number): Promise<Link> {
  let deliver: (report: BuildReport) => void = () => {};
  const report = new Promise<BuildReport>((resolve) => {
    deliver = resolve;
  });

  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    const answer = (status: number, body = '', type = 'text/plain') => {
      response.writeHead(status, {
        ...CORS,
        'content-type': type,
        'cache-control': 'no-store',
      });
      response.end(body);
    };
    if (request.method === 'OPTIONS') return answer(204);
    if (request.method === 'GET' && request.url === '/capture') {
      return answer(200, capture, 'application/json');
    }
    if (request.method === 'POST' && request.url === '/report') {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await readBody(request));
      } catch (error) {
        return answer(400, (error as Error).message);
      }
      if (!isReport(parsed))
        return answer(400, 'That is not an nxds Figma build report.');
      answer(204);
      deliver(parsed);
      return;
    }
    answer(404, 'Not found.');
  };

  const servers: Server[] = [];
  const open = (host: string, on: number) => {
    const server = createServer(
      (request, response) => void handle(request, response)
    );
    servers.push(server);
    return listen(server, on, host);
  };
  try {
    await open('127.0.0.1', port);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
      throw new PortInUseError(
        `Port ${port} is already in use on this machine.`
      );
    }
    throw error;
  }
  const bound = (servers[0]?.address() as AddressInfo).port;
  try {
    await open('::1', bound);
  } catch (error) {
    // A machine without IPv6 still answers on 127.0.0.1.
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EADDRINUSE') {
      await Promise.all(
        servers.map((server) => new Promise((resolve) => server.close(resolve)))
      );
      throw new PortInUseError(
        `Port ${bound} is already in use on this machine.`
      );
    }
    if (code !== 'EADDRNOTAVAIL' && code !== 'EAFNOSUPPORT') throw error;
    servers.pop();
  }

  return {
    port: bound,
    report,
    close: async () => {
      await Promise.all(
        servers.map(
          (server) =>
            new Promise<void>((resolve) => {
              server.closeAllConnections();
              server.close(() => resolve());
            })
        )
      );
    },
  };
}
