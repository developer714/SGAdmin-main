const ExternalLogType = {
  MIN: 0,
  GENERAL: 0,
  ELASTIC_SEARCH: 1,
  SPLUNK: 2,
  SUMO_LOGIC: 3,
  AMAZON_CLOUD_WATCH: 4,
  AMAZON_CLOUD_WATCH_2: 5,
  GOOGLE_STACK_DRIVER: 6,
  IBM_QRADAR: 7,
  JOURNAL: 8,
  LOGENTRIES: 9,
  LOGGLY: 10,
  MS_OMS: 11,
  SYSLOG: 12,
  MAX: 12,
};

const ExternalLogTypeString = {
  GENERAL: "General",
  ELASTIC_SEARCH: "Elastic Search",
  SPLUNK: "Splunk",
  SUMO_LOGIC: "Sumo Logic",
  AMAZON_CLOUD_WATCH: "Amazon Cloud Watch",
  AMAZON_CLOUD_WATCH_2: "Amazon Cloud Watch",
  GOOGLE_STACK_DRIVER: "Google Stackdriver",
  IBM_QRADAR: "IBM QRadar",
  JOURNAL: "Journal",
  LOGENTRIES: "Logentries",
  LOGGLY: "Loggly",
  MS_OMS: "Microsoft Operation Management Suite",
  SYSLOG: "Syslog",
};

module.exports = {
  ExternalLogType,
  ExternalLogTypeString,
};
