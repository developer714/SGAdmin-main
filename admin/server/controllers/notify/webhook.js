const Joi = require("joi");

const webhookService = require("../../service/notify/webhook");

function getWebhookPeriod(req, res, next) {
  webhookService
    .getWebhookPeriod()
    .then((period) => res.json(period))
    .catch(next);
}

module.exports = {
  getWebhookPeriod,
};
