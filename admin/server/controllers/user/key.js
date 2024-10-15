const keyService = require("../../service/key");

function getKeys(req, res, next) {
  keyService
    .getKeys(req.user)
    .then((keys) => res.json(keys))
    .catch((err) => next(err));
}

function createKey(req, res, next) {
  keyService
    .createKey(req.user, req.body)
    .then((key) => res.json(key))
    .catch((err) => next(err));
}

function updateKey(req, res, next) {
  keyService
    .updateKey(req.user, req.params.key_id, req.body)
    .then((key) => res.json(key))
    .catch((err) => next(err));
}

module.exports = { getKeys, createKey, updateKey };
