import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Unit tests only — pure functions in src/lib. No DOM, no Next runtime, no
// Supabase. RLS / policy behaviour is covered separately by the pgTAP suite
// (supabase/tests, `npm run test:db`).
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
