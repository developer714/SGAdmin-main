const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const process = require("process");
const ipfilter = require("express-ipfilter").IpFilter;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler } = require("./middleware/error-handler");
const logger = require("./helpers/logger");
const httpLogger = require("./helpers/httpLogger");
const morgan = require("morgan");

const connectDB = require("./config/db");
const path = require("path");
const { checkAllLicenses } = require("./service/paywall");
const wafService = require("./service/admin/nodes/waf_engine");
const edgeService = require("./service/admin/nodes/rl_engine");
const bmEngineService = require("./service/admin/nodes/bm_engine");
const adEngineService = require("./service/admin/nodes/ad_engine");
const esEngineService = require("./service/admin/nodes/es_engine");
const ombServiceService = require("./service/admin/nodes/omb_service");
const regionService = require("./service/admin/region");
const { checkHealth4Sites } = require("./service/site");
const { CertificateGeneration } = require("./helpers/forge");
const { loadStripeInstance } = require("./helpers/paywall");
const { isSecondaryOmb } = require("./helpers/env");
const { INTERNAL_PORT } = require("./constants/admin/Waf");
const { loadWafSslConfig, loadSgCerts } = require("./service/admin/node");
const { deleteAllOldAdAccessLogs } = require("./service/es");
const { loadWebhookProcess, uploadToExternalWebhooks } = require("./service/notify/webhook");
const { checkCertsExpiry } = require("./service/config/ssl");

const app = express();
app.use(helmet());

// Connect Database
connectDB();

// Allow the following IPs
const ips = ["::ffff:127.0.0.1", "::1"];
app.use(ipfilter(ips, { mode: "allow" }));

// Init Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(httpLogger);
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});
morgan.token("host", (req, res) => {
  return req.hostname;
});

// Define Routes
// User routes
app.use("/api/user/v1", require("./routes/api/user/v1"));

// Super Admin routes should be available for OMB-Serivce, since it contains /api/admin/v1/node route.
app.use("/api/admin", require("./routes/api/admin"));

if (!isSecondaryOmb()) {
  // Notify routes
  app.use("/api/notify", require("./routes/api/notify"));
}

// global error handler
app.use(errorHandler);

/*
// Serve static assets in production
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static("client/build"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}
*/
app.on("db_ready", async () => {
  try {
    let bMustApply = await CertificateGeneration.LoadRootCA();
    await loadSgCerts();
    if (isSecondaryOmb()) {
      await loadWafSslConfig(undefined, true);
    }

    if (bMustApply) {
      await wafService.applySgCertConfig();
    }
  } catch (err) {
    logger.error(err);
  }

  // loadStripeInstance regardless the result of the previous operations.
  try {
    await loadStripeInstance();
  } catch (err) {
    logger.error(err);
  }
  if (!isSecondaryOmb()) {
    await loadWebhookProcess();
    checkAllLicenses();
    deleteAllOldAdAccessLogs();
    checkHealth4Sites();
    checkCertsExpiry();
    wafService.checkHealth4WafEngineNodes();
    edgeService.checkHealth4RlEngineNodes();
    bmEngineService.checkHealth4BmEngineNodes();
    adEngineService.checkHealth4AdEngineNodes();
    esEngineService.checkHealth4EsEngineNodes();
    ombServiceService.checkHealth4OmbServiceNodes();
    regionService.checkHealth4AllRegions(true);
  } else {
    uploadToExternalWebhooks();
  }

  // start the Express server
  app.listen(INTERNAL_PORT, () => logger.info(`SenseDefence Admin backend server started on port ${INTERNAL_PORT}`));
});

mongoose.connection.once("open", () => {
  app.emit("db_ready");
});
