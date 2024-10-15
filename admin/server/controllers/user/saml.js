const samlService = require("../../service/saml");

function getConnections(req, res, next) {
  samlService
    .getConnections(req.user)
    .then((data) => res.json(data))
    .catch(next);
}

function getConnectionById(req, res, next) {
  samlService
    .getConnectionById(req.user, req.params.connection_id)
    .then((data) => res.json(data))
    .catch(next);
}

function createConnection(req, res, next) {
  samlService
    .createConnection(req.user, req.body)
    .then((data) => res.json(data))
    .catch(next);
}

function updateConnection(req, res, next) {
  samlService
    .updateConnection(req.user, req.params.connection_id, req.body)
    .then((data) => res.json(data))
    .catch(next);
}

function deleteConnection(req, res, next) {
  samlService
    .deleteConnection(req.user, req.params.connection_id)
    .then((data) => res.json(data))
    .catch(next);
}

module.exports = {
  getConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
};
