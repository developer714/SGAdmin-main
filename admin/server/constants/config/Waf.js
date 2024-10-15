const WafAction = {
  DETECT: 0,
  BLOCK: 1,
  CHALLENGE: 2,
  ALL: 3,
};

const WafType = {
  MIN: -1,
  ALL: -1,
  SIGNATURE: 0,
  MLFWAF: 1,
  SENSEDEFENCE_SIGNATURE: 2,
  FIREWALL: 3,
  MAX: 3,
};

const WafLevel = {
  FAST: 0,
  TRADEOFF: 1,
};

const WafStatus = {
  UNHEALTHY: 0,
  DISABLED: 1,
  DETECT: 2,
  BLOCK: 3,
};

const SigAnomalyScore = {
  VERY_LOW: 40,
  LOW: 25,
  MEDIUM: 10,
  HIGH: 5,
};

const ParanoiaLevel = {
  MIN: 1,
  MAX: 4,
};

const SeverityLevel = {
  MIN: 0,
  INFO: 1,
  NOTICE: 2,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5,
};

const SeverityName = {
  UNKNOWN: "Unknown",
  INFO: "INFO",
  NOTICE: "NOTICE",
  WARNING: "WARNING",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
};

const CrsRuleNo = {
  CUSTOM: 400,
  CUSTOM_GLOBAL: 409,
  MLFWAF: 410,
  MIN_SD_SIG_RULE: 450,
  MAX_SD_SIG_RULE: 499,
  EXCLUSION_RULES_BEFORE_CRS: 900,
  INITIALIZATION: 901,
  OWASP_SQLI: 942,
  REQUEST_BLOCKING_EVALUATION: 949,
  RESPONSE_BLOCKING_EVALUATION: 959,
  EXCLUSION_RULES_AFTER_CRS: 999,
};

const CrsSecRuleId = {
  MIN_EXCEPTION: CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS * 1000 + 1,
  MIN_CUSTOM: CrsRuleNo.CUSTOM * 1000,
  MAX_CUSTOM: CrsRuleNo.MLFWAF * 1000 - 1,
  MIN_CUSTOM_GLOBAL: CrsRuleNo.CUSTOM_GLOBAL * 1000,
  MAX_CUSTOM_GLOBAL: CrsRuleNo.CUSTOM_GLOBAL * 1000 + 999,
  MIN_MLFWAF: CrsRuleNo.MLFWAF * 1000,
  MAX_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 9999,
  REAL_MIN_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 100,
  REAL_MAX_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 199,
  MIN_SD_SIG: CrsRuleNo.MIN_SD_SIG_RULE * 1000,
  MAX_SD_SIG: CrsRuleNo.MAX_SD_SIG_RULE * 1000 + 999,
  ANOMALY_EVALUATION: CrsRuleNo.MLFWAF * 1000 + 220,
  MIN_FIREWALL: CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS * 1000 + 1,
  MAX_FIREWALL: CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS * 1000 + 999,
  MIN_OWASP_MODSECURITY: CrsRuleNo.INITIALIZATION * 1000,
};

const MlFwafSensitivity = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
};

const ExceptionSkipRuleType = {
  ALL: 0,
  MLFWAF: 1,
  SIGNATURE: 2,
  SENSEDEFENCE_SIGNATURE: 3,
};

const CUSTOM_RULE_NAME = "REQUEST-400-CUSTOM-RULES";
const CUSTOM_RULE_DESCRIPTION = "Custom Rules";

const WAF_CONFIG_TIMEOUT = 5000; // 5 Seconds

const SITE_ID_ALL = "all";

module.exports = {
  WafAction,
  WafType,
  WafLevel,
  WafStatus,
  SigAnomalyScore,
  ParanoiaLevel,
  SeverityLevel,
  SeverityName,
  CrsRuleNo,
  CrsSecRuleId,
  MlFwafSensitivity,
  ExceptionSkipRuleType,
  CUSTOM_RULE_NAME,
  CUSTOM_RULE_DESCRIPTION,
  WAF_CONFIG_TIMEOUT,
  SITE_ID_ALL,
};
