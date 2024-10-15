function basicBotConfigDetails(bot_config) {
  const { enabled, good_bot_action, bad_bot_action } = bot_config;
  return { enabled, good_bot_action, bad_bot_action };
}

module.exports = { basicBotConfigDetails };
