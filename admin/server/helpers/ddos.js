function basicDdosConfigDetails(bot_config) {
  const { sensitivity, timeout, browser_integrity } = bot_config;
  return { sensitivity, timeout, browser_integrity };
}

module.exports = { basicDdosConfigDetails };
