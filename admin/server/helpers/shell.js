const { promisify } = require("util");
const child_process = require("child_process");
const exec = promisify(child_process.exec);
const { isProductionEnv } = require("./env");
const logger = require("./logger");

async function execShellCmd(sCommand) {
  logger.debug(`execShellCmd ${sCommand}`);
  if (!isProductionEnv()) {
    return null;
  }
  try {
    const execResult = await exec(sCommand);
    if (execResult.stdout) {
      logger.info(`stdout: ${execResult.stdout}`);
      return execResult.stdout;
    }
    if (execResult.stderr) {
      logger.error(`stderr: ${execResult.stderr}`);
    }
  } catch (error) {
    logger.error(`error: ${error.message}`);
  }
  return null;
}

async function restartService(svcName) {
  logger.debug(`restartService ${svcName}`);
  const sCommand = `sudo systemctl restart ${svcName}`;
  await execShellCmd(sCommand);
}

module.exports = { execShellCmd, restartService };
