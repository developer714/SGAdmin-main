import jwtDecode from "jwt-decode";
import { verify, sign } from "jsonwebtoken";
import userAxios from "./axios/v1/userAxios";
import adminAxios from "./axios/v1/adminAxios";
import { UserRole } from "./constants";

const getTokenExp = (accessToken) => {
  if (!accessToken) {
    return 0;
  }
  const decoded = jwtDecode(accessToken);
  return decoded?.exp;
};

const isValidToken = (accessToken) => {
  const exp = getTokenExp(accessToken);
  const currentTime = Date.now() / 1000;

  return exp > currentTime;
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    userAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // const clientIp = await getClientPublicIp();
    // if (0 < clientIp.length) {
    //     userAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     userAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    // }
  } else {
    localStorage.removeItem("accessToken");
    delete userAxios.defaults.headers.common.Authorization;
    // delete userAxios.defaults.headers.common["X-Forwarded-For"];
    // delete userAxios.defaults.headers.common["X-Real-IP"];
  }
};
const setSuperSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessSuperToken", accessToken);
    adminAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    userAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    // const clientIp = await getClientPublicIp();
    // if (0 < clientIp.length) {
    //     adminAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     adminAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    //     userAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     userAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    // }
  } else {
    localStorage.removeItem("accessSuperToken");
    delete adminAxios.defaults.headers.common.Authorization;
    delete userAxios.defaults.headers.common.Authorization;
    // delete adminAxios.defaults.headers.common["X-Forwarded-For"];
    // delete adminAxios.defaults.headers.common["X-Real-IP"];
    // delete userAxios.defaults.headers.common["X-Forwarded-For"];
    // delete userAxios.defaults.headers.common["X-Real-IP"];
  }
};
const setOrganisationSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessOrganisationToken", accessToken);
    adminAxios.defaults.headers.common.Organisation = accessToken;
    userAxios.defaults.headers.common.Organisation = accessToken;
    // const clientIp = await getClientPublicIp();
    // if (0 < clientIp.length) {
    //     adminAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     adminAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    //     userAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     userAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    // }
  } else {
    localStorage.removeItem("accessOrganisationToken");
    delete adminAxios.defaults.headers.common.Organisation;
    delete userAxios.defaults.headers.common.Organisation;
    // delete adminAxios.defaults.headers.common["X-Forwarded-For"];
    // delete adminAxios.defaults.headers.common["X-Real-IP"];
    // delete userAxios.defaults.headers.common["X-Forwarded-For"];
    // delete userAxios.defaults.headers.common["X-Real-IP"];
  }
};
const setImpersonateSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessImpersonateToken", accessToken);
    adminAxios.defaults.headers.common.Impersonate = accessToken;
    userAxios.defaults.headers.common.Impersonate = accessToken;
    // const clientIp = await getClientPublicIp();
    // if (0 < clientIp.length) {
    //     adminAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     adminAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    //     userAxios.defaults.headers.common["X-Forwarded-For"] = clientIp;
    //     userAxios.defaults.headers.common["X-Real-IP"] = clientIp;
    // }
  } else {
    localStorage.removeItem("accessImpersonateToken");
    delete adminAxios.defaults.headers.common.Impersonate;
    delete userAxios.defaults.headers.common.Impersonate;
    // delete adminAxios.defaults.headers.common["X-Forwarded-For"];
    // delete adminAxios.defaults.headers.common["X-Real-IP"];
    // delete userAxios.defaults.headers.common["X-Forwarded-For"];
    // delete userAxios.defaults.headers.common["X-Real-IP"];
  }
};
const setOrganisationName = (name) => {
  if (name) {
    localStorage.setItem("OrgName", name);
  } else {
    localStorage.removeItem("OrgName");
  }
};
const setOrganisationAdmin = (admin) => {
  if (admin) {
    localStorage.setItem("OrgAdmin", admin);
  } else {
    localStorage.removeItem("OrgAdmin");
  }
};

const isSuperAdmin = (role) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.SUPPORT_ADMIN:
    case UserRole.PAYMENT_ADMIN:
    case UserRole.READONLY_ADMIN:
      return true;
    default:
      return false;
  }
};
/*
var clientPublicIp = "";

const getClientPublicIp = async () => {
    if (0 < clientPublicIp.length) return clientPublicIp;
    const axios = require("axios");
    let res;
    let data;
    try {
        res = await axios.get("https://api.ipify.org?format=json");
        data = res.data;
        clientPublicIp = data.ip;
    } catch (err) {
        console.error(err);
    }
    if (0 < clientPublicIp.length) {
        return clientPublicIp;
    }

    try {
        res = await axios.get("https://www.cloudflare.com/cdn-cgi/trace");
        data = res.data;
        data = data
            .trim()
            .split("\n")
            .reduce(function (obj, pair) {
                pair = pair.split("=");
                obj[pair[0]] = pair[1];
                return obj;
            }, {});
        clientPublicIp = data.ip;
    } catch (err) {
        console.error(err);
    }
    if (0 < clientPublicIp.length) {
        return clientPublicIp;
    }

    try {
        res = await axios.get("https://json.geoiplookup.io/");
        data = res.data;
        clientPublicIp = data.ip;
    } catch (err) {
        console.error(err);
    }
    if (0 < clientPublicIp.length) {
        return clientPublicIp;
    }

    return clientPublicIp;
};
*/

export {
  verify,
  sign,
  isValidToken,
  getTokenExp,
  setSession,
  setSuperSession,
  setOrganisationSession,
  setImpersonateSession,
  setOrganisationName,
  setOrganisationAdmin,
  isSuperAdmin,
};
