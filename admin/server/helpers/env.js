const fs = require("fs");
const process = require("process");
const { env } = process;

function isProductionEnv() {
  return "production" === env.NODE_ENV;
}

function isSecondaryOmb() {
  return true === env.OMB || "true" === env.OMB;
}

const OsName = {
  WIN32: "win32",
  CENTOS: "centos",
  DEBIAN: "debian",
  UBUNTU: "ubuntu",
  UNIX: "unix",
};

/**
* 
* @returns "win32", "centos", "debian", "ubuntu", "unix"
*/
function getOS() {
  switch (process.platform) {
  case "win32":
      return OsName.WIN32;
  case "linux": {
      const OS_RELEASE_PATH = "/etc/os-release";
      if (!fs.existsSync(OS_RELEASE_PATH)) {
          return OsName.CENTOS;
      }
      const fileContent = fs.readFileSync(OS_RELEASE_PATH, "utf8");
      const lines = fileContent.split('\n');
      const releaseDetails = {};
      lines.forEach((line, _) => {
          // Split the line into an array of words delimited by '='
          if (!line) return;
          const words = line.split('=');
          releaseDetails[words[0].trim().toLowerCase()] = words[1].trim();
      });
      if ("id" in releaseDetails) {
          return releaseDetails.id;
      }
      return OsName.CENTOS;
  }
  default:
      return OsName.UNIX;
  }
}

module.exports = { OsName, isProductionEnv, isSecondaryOmb, getOS };
