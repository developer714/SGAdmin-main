module.exports = {
  apps: [
    {
      name: "SDOMSecondaryBackend",
      script: "./server.js",
      watch: true,
      watch_delay: 1000,
      ignore_watch: ["logs", "node_modules"],
      env: {
        PORT: 5005,
        NODE_ENV: "development",
        OMB: true,
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
