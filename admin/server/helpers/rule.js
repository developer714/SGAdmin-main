const { execFileSync } = require("node:child_process");
const fs = require("fs");
const os = require("os");
const { isValidString } = require("./validator");
const logger = require("./logger");
const { CrsSecRuleId } = require("../constants/config/Waf");
const { isProductionEnv } = require("./env");

function basicRuleDetails(rule) {
  const { comment, description, name, rule_id, secmarker } = rule;
  return {
    rule_id,
    comment,
    description,
    name,
    secmarker,
  };
}

const TOOL_RULES_CHECK_PATH = "/usr/local/modsecurity/bin/modsec-rules-check";

async function parseCrsSecRule(content, isCustom = true) {
  let sId = "";
  if (!isProductionEnv()) {
    // For debug and test in Windows
    let nPos = content.indexOf('"id:');
    if (-1 == nPos) {
      throw "Invalid Rule " + content;
    }
    let nPos2 = content.indexOf(",", nPos + 4);
    if (-1 == nPos2) {
      throw "Invalid Rule " + content;
    }
    sId = content.substring(nPos + 4, nPos2);
  } else {
    const sTempRuleDir = os.homedir() + "/CustomSecRules";
    if (!fs.existsSync(sTempRuleDir)) {
      fs.mkdirSync(sTempRuleDir);
    }

    let iRule = 0;
    let sTempFilePath = "";
    while (true) {
      sTempFilePath = sTempRuleDir + "/" + iRule;
      if (fs.existsSync(sTempFilePath)) {
        iRule++;
        continue;
      }
      break;
    }

    fs.writeFileSync(sTempFilePath, content);
    let sOutput = "";
    try {
      sOutput = execFileSync(TOOL_RULES_CHECK_PATH, [sTempFilePath]).toString();
    } catch (err) {
      logger.debug(err.message);
      fs.rmSync(sTempFilePath, { force: true });
      throw "Invalid Rule content";
    }
    const aLines = sOutput.split(/(?:\r\n|\r|\n)/g);
    fs.rmSync(sTempFilePath, { force: true });
    if (2 > aLines.length) {
      throw "Invalid Rule content";
    }
    const nRulesCount = parseInt(aLines[0]);
    if (1 != nRulesCount) {
      throw "Invalid Rule content";
    }

    sId = aLines[1];
  }

  const nId = parseInt(sId);
  if (isCustom) {
    if (CrsSecRuleId.MIN_CUSTOM > nId || CrsSecRuleId.MAX_CUSTOM < nId) {
      throw "Invalid Rule Id " + sId;
    }
  }
  return nId;
}

function parseRuleComment(comment) {
  let sRet = "";
  if (!isValidString(comment)) return sRet;
  const aLines = comment.split("\n");
  for (let sLine of aLines) {
    if (sLine.substring(0, 1) != "#") {
      sLine = "#" + sLine;
    }
    sRet += sLine + "\n";
  }
  return sRet;
}

module.exports = { basicRuleDetails, parseCrsSecRule, parseRuleComment };
