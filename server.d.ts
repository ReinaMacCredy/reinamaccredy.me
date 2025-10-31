// Bun type declarations for server.ts
// This file provides types for Bun-specific APIs used in server.ts
// Since server.ts is a standalone Bun script (not part of Next.js build),
// these types are only needed when running server.ts directly with Bun.

declare global {
  namespace Bun {
    function serve(options: {
      port: number;
      fetch: (req: Request) => Promise<Response>;
    }): {
      port: number;
      stop: () => void;
    };

    function file(path: string): {
      exists: () => Promise<boolean>;
      arrayBuffer: () => Promise<ArrayBuffer>;
    };

    function spawn(
      command: string[],
      options?: {
        stdin?: 'pipe' | 'inherit';
        stdout?: 'pipe' | 'inherit';
      }
    ): {
      stdin: {
        write: (data: string) => void;
        end: (data?: string) => void;
      };
    };
  }
}

export {};

