import { defineConfig } from "tsup";
import alias from "esbuild-plugin-alias";

export default defineConfig({
  entry: ["src"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  format: ["esm", "cjs"], // Gera ESM e CJS
  dts: true,
  clean: true,
  esbuildPlugins: [
    alias({
      "@": "./src",
    }),
  ],
  esbuildOptions(options) {
    options.outExtension = { ".js": ".js" }; // Mantém as extensões como .js
  },
});
