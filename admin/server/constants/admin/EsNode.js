const EsNodeType = {
  MIN: 1,
  TIE_BREAKER: 1,
  DATA: 2,
  MAX: 2,
};

const DEFAULT_ES_HTTP_PORT = 9200;
const DEFAULT_ES_TRANSPORT_PORT = 9300;

module.exports = {
  EsNodeType,
  DEFAULT_ES_HTTP_PORT,
  DEFAULT_ES_TRANSPORT_PORT,
};
