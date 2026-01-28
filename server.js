const path = require("path");

const dir = path.join(__dirname);

process.env.NODE_ENV = "production";
process.chdir(__dirname);

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false, tsconfigPath: "tsconfig.json" },
  distDir: "./.next",
  cleanDistDir: true,
  assetPrefix: "",
  cacheMaxMemorySize: 52428800,
  configOrigin: "next.config.ts",
  useFileSystemPublicRoutes: true,
  generateEtags: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  poweredByHeader: true,
  compress: true,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: "/_next/image",
    loader: "default",
    loaderFile: "",
    domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: ["image/webp"],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    contentDispositionType: "attachment",
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "upload.wikimedia.org",
    //     port: "",
    //     pathname: "/wikipedia/commons/**",
    //     search: "",
    //   },
    // ],
    unoptimized: false,
  },
  devIndicators: { position: "bottom-left" },
  onDemandEntries: { maxInactiveAge: 60000, pagesBufferLength: 5 },
  amp: { canonicalBase: "" },
  basePath: "",
  sassOptions: {},
  trailingSlash: false,
  i18n: null,
  productionBrowserSourceMaps: false,
  excludeDefaultMomentLocales: true,
  serverRuntimeConfig: {},
  publicRuntimeConfig: {},
  reactProductionProfiling: false,
  reactStrictMode: null,
  reactMaxHeadersLength: 6000,
  httpAgentOptions: { keepAlive: true },
  logging: {},
  expireTime: 31536000,
  staticPageGenerationTimeout: 60,
  output: "standalone",
  // modularizeImports: {
  //   "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" },
  //   lodash: { transform: "lodash/{{member}}" },
  // },
  outputFileTracingRoot: "/builds/collins/agpb",
  experimental: {
    nodeMiddleware: false,
    cacheLife: {
      default: { stale: 300, revalidate: 900, expire: 4294967294 },
      seconds: { stale: 0, revalidate: 1, expire: 60 },
      minutes: { stale: 300, revalidate: 60, expire: 3600 },
      hours: { stale: 300, revalidate: 3600, expire: 86400 },
      days: { stale: 300, revalidate: 86400, expire: 604800 },
      weeks: { stale: 300, revalidate: 604800, expire: 2592000 },
      max: { stale: 300, revalidate: 2592000, expire: 4294967294 },
    },
    cacheHandlers: {},
    cssChunking: true,
    multiZoneDraftMode: false,
    appNavFailHandling: false,
    prerenderEarlyExit: true,
    serverMinification: true,
    serverSourceMaps: false,
    linkNoTouchStart: false,
    caseSensitiveRoutes: false,
    clientSegmentCache: false,
    dynamicOnHover: false,
    preloadEntriesOnStart: true,
    clientRouterFilter: true,
    clientRouterFilterRedirects: false,
    fetchCacheKeyPrefix: "",
    middlewarePrefetch: "flexible",
    optimisticClientCache: true,
    manualClientBasePath: false,
    cpus: 7,
    memoryBasedWorkersCount: false,
    imgOptConcurrency: null,
    imgOptTimeoutInSeconds: 7,
    imgOptMaxInputPixels: 268402689,
    imgOptSequentialRead: null,
    isrFlushToDisk: true,
    workerThreads: false,
    optimizeCss: false,
    nextScriptWorkers: false,
    scrollRestoration: false,
    externalDir: false,
    disableOptimizedLoading: false,
    gzipSize: true,
    craCompat: false,
    esmExternals: true,
    fullySpecified: false,
    swcTraceProfiling: false,
    forceSwcTransforms: false,
    largePageDataBytes: 128000,
    typedRoutes: false,
    typedEnv: false,
    clientTraceMetadata: ["baggage", "webpackChunkName"],
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
    ppr: false,
    authInterrupts: false,
    webpackBuildWorker: true,
    webpackMemoryOptimizations: true,
    optimizeServerReact: true,
    useEarlyImport: false,
    viewTransition: false,
    routerBFCache: false,
    staleTimes: { dynamic: 0, static: 300 },
    serverComponentsHmrCache: true,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
    dynamicIO: false,
    inlineCss: false,
    useCache: false,
    optimizePackageImports: [
      "axios",
      "clsx",
      "cmdk",
      "date-fns",
      "embla-carousel-react",
      "input-otp",
      "lucide-react",
      "@hookform/resolvers",
      "@noxfed/lottie-webpack-loader",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@next/bundle-analyzer",
      "@radix-ui/react-tooltip",
      "@wikimedia/codex",
      "@wikimedia/codex-design-tokens",
      "@wikimedia/codex-icons",
      "react-day-picker",
      "react-hook-form",
      "react-joyride",
      "react-resizable-panels",
      "recharts",
      "sonner",
      "tailwind-merge",
      "tailwindcss-animate",
      "vaul",
      "zod",
      "zustand",
    ],
    trustHostHeader: false,
    isExperimentalCompile: false,
  },
  // htmlLimitedBots:
  //   "Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti",
  bundlePagesRouterDependencies: false,
  configFileName: "next.config.ts",
  turbopack: {
    rules: { "*.lottie": ["@noxfed/lottie-webpack-loader"] },
    root: "/builds/collins/agpb-v4-web",
  },
  serverExternalPackages: [
    "amqplib",
    "connect",
    "dataloader",
    "express",
    "generic-pool",
    "graphql",
    "@hapi/hapi",
    "ioredis",
    "kafkajs",
    "koa",
    "lru-memoizer",
    "mongodb",
    "mongoose",
    "mysql",
    "mysql2",
    "knex",
    "pg",
    "pg-pool",
    "@node-redis/client",
    "@redis/client",
    "redis",
    "tedious",
  ],
  // _originalRewrites: {
  //   beforeFiles: [],
  //   afterFiles: [
  //     {
  //       source: "/monitoring(/?)",
  //       has: [
  //         { type: "query", key: "o", value: "(?<orgid>\\d*)" },
  //         { type: "query", key: "p", value: "(?<projectid>\\d*)" },
  //         { type: "query", key: "r", value: "(?<region>[a-z]{2})" },
  //       ],
  //       destination:
  //         "https://o:orgid.ingest.:region.sentry.io/api/:projectid/envelope/?hsts=0",
  //     },
  //     {
  //       source: "/monitoring(/?)",
  //       has: [
  //         { type: "query", key: "o", value: "(?<orgid>\\d*)" },
  //         { type: "query", key: "p", value: "(?<projectid>\\d*)" },
  //       ],
  //       destination:
  //         "https://o:orgid.ingest.sentry.io/api/:projectid/envelope/?hsts=0",
  //     },
  //   ],
  //   fallback: [],
  // },
};

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

require("next");
const { startServer } = require("next/dist/server/lib/start-server");

if (
  Number.isNaN(keepAliveTimeout) ||
  !Number.isFinite(keepAliveTimeout) ||
  keepAliveTimeout < 0
) {
  keepAliveTimeout = undefined;
}

startServer({
  dir,
  isDev: false,
  config: nextConfig,
  hostname,
  port: currentPort,
  allowRetry: false,
  keepAliveTimeout,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

// import express from "express";
// import next from "next";
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __dirname = dirname(fileURLToPath(import.meta.url));
// // const dev = process.env.NODE_ENV !== "production";
// const app = next({ dir: __dirname });
// const handle = app.getRequestHandler();
// const PORT = parseInt(process.env.PORT, 10) || 3000;

// app.prepare().then(() => {
//   const server = express();

//   // Serve static files from the .next directory
//   server.use('./', express.static(join(__dirname, '.next')));

//   // Let Next.js handle all other routes
//   server.all('*', async (req, res) => {
//     try {
//       await handle(req, res);
//     } catch (err) {
//       console.error('Error occurred handling', req.url, err);
//       res.status(500).send('Internal Server Error');
//     }
//   });

//   server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
// });
