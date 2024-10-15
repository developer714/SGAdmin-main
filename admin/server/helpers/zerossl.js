const axios = require("axios");
const fs = require("fs");
const os = require("os");
const FormData = require("form-data");

const logger = require("./logger");
const { getPureCurrentZerosslApiKey } = require("../service/admin/ssl");
const { DEFAULT_C, DEFAULT_L, DEFAULT_O, DEFAULT_OU, DEFAULT_ST } = require("../constants/config/Cert");
const { CreateCSR } = require("./forge");

const GENERATE_CSR_URL = "https://csrgenerator.com/generate";
const ZEROSSL_API_BASEURL = "https://api.zerossl.com";

async function createCert(site_id) {
  // generate CSR
  /*
    const bodyFormData = new FormData();
    bodyFormData.append("C", DEFAULT_C);
    bodyFormData.append("ST", DEFAULT_ST);
    bodyFormData.append("L", DEFAULT_L);
    bodyFormData.append("O", DEFAULT_O);
    bodyFormData.append("OU", DEFAULT_OU);
    bodyFormData.append("CN", "*." + site_id);
    bodyFormData.append("keySize", "4096");
    let res = await axios({
        method: "post",
        url: GENERATE_CSR_URL,
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
    });
    const aBlocks = res.data.split(/(?:\r\n\r\n|\r\r|\n\n)/g);
    if (2 !== aBlocks.length) {
        throw "Failed to generate CSR for site " + site_id;
    }
    const sCsrContent = aBlocks[0];
    const sPrivKeyContent = aBlocks[1];
    */
  const { csr, privateKey } = CreateCSR(`*.${site_id}`);
  const sCsrContent = csr;
  const sPrivKeyContent = privateKey;

  const sTempCertDir = `${os.homedir()}/certs/${site_id}`;
  if (!fs.existsSync(sTempCertDir)) {
    fs.mkdirSync(sTempCertDir, { recursive: true });
  }
  const sCsrFilePath = `${sTempCertDir}/${site_id}.csr`;
  const sPrivKeyPath = `${sTempCertDir}/privkey.pem`;
  fs.writeFileSync(sCsrFilePath, sCsrContent);
  fs.writeFileSync(sPrivKeyPath, sPrivKeyContent);

  // verify CSR
  const zeroSslApiKey = await getPureCurrentZerosslApiKey();
  const sValidateCsrApiUrl = `${ZEROSSL_API_BASEURL}/validation/csr?access_key=${zeroSslApiKey}`;
  const csrParams = new FormData();
  csrParams.append("csr", sCsrContent);

  res = await axios.post(sValidateCsrApiUrl, csrParams, {
    headers: csrParams.getHeaders(),
  });
  if (!res.data.valid) {
    throw "Invalid CSR";
  }

  // create cert
  const sCreateCertApiUrl = `${ZEROSSL_API_BASEURL}/certificates?access_key=${zeroSslApiKey}`;
  const createCertParams = new FormData();
  createCertParams.append("certificate_domains", `*.${site_id}`);
  createCertParams.append("certificate_csr", sCsrContent);
  createCertParams.append("certificate_validity_days", 90);
  res = await axios.post(sCreateCertApiUrl, createCertParams, {
    headers: createCertParams.getHeaders(),
  });
  if (!res.data.type) {
    throw "Failed to create Sense Defence Managed certificate";
  }
  let certInfo = {
    id: res.data.id,
    cname_validation_p1: res.data?.validation?.other_methods[`*.${site_id}`]?.cname_validation_p1,
    cname_validation_p2: res.data?.validation?.other_methods[`*.${site_id}`]?.cname_validation_p2,
  };
  return certInfo;
}

const g_mapRetryCount = new Map();

async function verifyDomain(domain, cert_id, verifyCallback, issueCallback, failCallback) {
  const zeroSslApiKey = await getPureCurrentZerosslApiKey();
  const sVerifyDomainApiUrl = `${ZEROSSL_API_BASEURL}/certificates/${cert_id}/challenges?access_key=${zeroSslApiKey}`;
  const verifyDomainParams = new FormData();
  verifyDomainParams.append("validation_method", "CNAME_CSR_HASH");
  let res = await axios.post(sVerifyDomainApiUrl, verifyDomainParams, {
    headers: verifyDomainParams.getHeaders(),
  });
  if (false === res.data.success) {
    throw "Failed to verify domain for Sense Defence Managed Certificates, error type: " + res.data.error?.type;
  }
  if ("pending_validation" !== res.data.status && "issued" !== res.data.status) {
    throw "Failed to verify domain Sense Defence Managed Certificates, status: " + res.data.status;
  }

  // get domain verification status
  /*const getStatusApiUrl = `${ZEROSSL_API_BASEURL}/certificates/${cert_id}/status?access_key=${zeroSslApiKey}`;
    res = await axios.get(getStatusApiUrl);
    if (!res.data.validation_completed) {
        throw "Failed to verify domain Sense Defence Managed Certificates";
    }*/

  await verifyCallback(domain);

  // Register timeout callback if domain verification is successful
  g_mapRetryCount.set(domain, 0);
  const applyDelay = 10 * 1000; // 10 seconds
  setTimeout(applyWildcardCert, applyDelay, issueCallback, domain, cert_id, failCallback);
}

function isWildcardCertPending(domain) {
  return g_mapRetryCount.has(domain);
}

async function applyWildcardCert(issueCallback, domain, cert_id, failCallback) {
  if (!g_mapRetryCount.has(domain)) return;
  if (5 < g_mapRetryCount.get(domain)) {
    g_mapRetryCount.delete(domain);
    logger.error(`applyWildcardCert failed, over max retry count for ${domain}`);
    if (failCallback) {
      await failCallback(domain);
    }
    return;
  }
  const zeroSslApiKey = await getPureCurrentZerosslApiKey();
  // donwload certs
  const downloadCertApiUrl = `${ZEROSSL_API_BASEURL}/certificates/${cert_id}/download/return?access_key=${zeroSslApiKey}`;
  const res = await axios.get(downloadCertApiUrl);
  if (false === res.data.success || undefined === res.data["certificate.crt"]) {
    const applyDelay = 10 * 1000 * Math.pow(2, g_mapRetryCount.get(domain)); // 10 seconds
    g_mapRetryCount.set(domain, g_mapRetryCount.get(domain) + 1); // increase retry count
    setTimeout(applyWildcardCert, applyDelay, issueCallback, domain, cert_id, failCallback);
    return;
  }
  const certs = {
    fullchain: res.data["certificate.crt"] + res.data["ca_bundle.crt"],
    chain: res.data["ca_bundle.crt"],
  };

  const sTempCertDir = `${os.homedir()}/certs/${domain}`;
  if (!fs.existsSync(sTempCertDir)) {
    fs.mkdirSync(sTempCertDir, { recursive: true });
  }
  const sFullchainFilePath = `${sTempCertDir}/fullchain.pem`;
  const sPrivkeyFilePath = `${sTempCertDir}/privkey.pem`;
  const sChainFilePath = `${sTempCertDir}/chain.pem`;
  fs.writeFileSync(sFullchainFilePath, certs.fullchain);
  fs.writeFileSync(sChainFilePath, certs.chain);
  const privkey = fs.readFileSync(sPrivkeyFilePath).toString();
  certs.privkey = privkey;
  await issueCallback(domain, certs);
  g_mapRetryCount.delete(domain);
}

module.exports = { createCert, verifyDomain, isWildcardCertPending };
