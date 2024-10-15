const audit_action_data = require("../data/audit-action.json");
const audit_disble_data = require("../data/audit-action-disable.json");

const isValidParam = (params) => {
  if (undefined === params) return false;
  if (0 === Object.keys(params).length) return false;
  return true;
};

const getKeyFromParamValue = (params, value) => {
  if (!isValidParam(params)) return undefined;
  for (key in params) {
    if (params[key] === value) return key;
  }
  return undefined;
};

const isAuditLogDisabled = (url, method, params) => {
  // trim the first slash
  if ("/" === url[0]) {
    url = url.substr(1);
  }

  // add the last slash
  if ("/" !== url.substr(-1)) {
    url += "/";
  }
  let aBlocks = url.split("/");
  const nBlocks = aBlocks.length;
  if (1 < nBlocks && "notify" == aBlocks[1]) {
    return true;
  }
  let action = audit_disble_data;
  if (!(method in action)) return false;

  action = action[method];
  for (let iBlock = 0; iBlock < nBlocks; iBlock++) {
    if (iBlock < nBlocks) {
      let sUrli = aBlocks[iBlock];
      if (Array.isArray(action)) {
        if (isValidParam(params)) {
          const key = getKeyFromParamValue(params, sUrli);
          if (key) {
            sUrli = ":" + key;
          }
        }
        let x = action.findIndex((a) => a === sUrli);
        if (-1 < x) {
          return true;
        } else {
          return false;
        }
      } else {
        if (!(sUrli in action)) return false;
        action = action[sUrli];
      }
    }
  }
  return false;
};

const getAuditAction = (url, method, params) => {
  const sFuncName = "getAuditAction";
  let Url = url;
  // trim the first slash
  if ("/" === url[0]) {
    url = url.substr(1);
  }

  // add the last slash
  if ("/" !== url.substr(-1)) {
    url += "/";
  }
  aBlocks = url.split("/");
  let nBlockNumber = aBlocks.length;
  if (2 > nBlockNumber) {
    throw `Invalid URL ${url}`;
  }
  const sUrl0 = aBlocks[0];
  if ("api" !== sUrl0) {
    throw `Invalid URL ${url}`;
  }
  const sUrl1 = aBlocks[1];

  let action = audit_action_data;
  if (!(method in action)) {
    throw `${sFuncName} Invalid HTTP method ${method}`;
  }
  action = action[method];
  if (!(sUrl0 in action)) {
    throw `${sFuncName} Invalid prefix ${sUrl0}`;
  }
  action = action[sUrl0];
  if (!(sUrl1 in action)) {
    throw `${sFuncName} Invalid url1 ${sUrl1}`;
  }
  action = action[sUrl1];

  let nCurDepth = 2;
  while (true) {
    if (nCurDepth > nBlockNumber) break;
    const sUrli = aBlocks[nCurDepth];
    if (!(sUrli in action)) {
      let key;
      if (isValidParam(params)) {
        // Normal routes with params
        key = getKeyFromParamValue(params, sUrli);
      }
      if (key) {
        action = action[":" + key];
        Url = `/${sUrl0}/${sUrl1}`;
        for (let i = 2; i < nCurDepth; i++) {
          Url += "/" + aBlocks[i];
        }
        Url += "/:" + key;
      } else {
        throw `${sFuncName} Invalid url${nCurDepth} ${sUrli}`;
      }
    } else {
      action = action[sUrli];
    }
    if ("string" === typeof action || nCurDepth + 1 === nBlockNumber) return { Url, action };
    nCurDepth++;
  }
  return { Url, action };
};

module.exports = { isAuditLogDisabled, getAuditAction };
