module.exports = {
  apps: [
    {
      name: "SDOMPrimaryBackend",
      script: "./server.js",
      watch: true,
      watch_delay: 1000,
      ignore_watch: ["logs", "node_modules"],
      env: {
        PORT: 5000,
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
