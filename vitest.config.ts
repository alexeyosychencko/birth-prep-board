import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" throws unless the "react-server" export condition is
      // active; Vitest doesn't set it. Point at the package's own no-op
      // export (what that condition resolves to) instead of changing
      // resolution conditions globally, which would also affect react/
      // react-dom resolution for any future component tests.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
})
