import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"

// Nitro's server plugin breaks module loading under Vitest 4, and tests never
// need the server output, so it only runs outside the test runner.
const isTest = !!process.env.VITEST

const config = defineConfig({
  resolve: {
    // Vite 8 resolves tsconfig `paths` (e.g. "@/*") natively.
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    !isTest && nitro(),
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        // Specifies the directory TanStack Router uses for your routes.
        routesDirectory: "app", // Defaults to "routes", relative to srcDirectory
      },
    }),
    viteReact(),
  ],
})

export default config
