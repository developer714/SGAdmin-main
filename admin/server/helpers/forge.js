const forge = require("node-forge");
const fs = require("fs");
const os = require("os");
// const crypto = require("crypto");
const { DEFAULT_C, DEFAULT_CN, DEFAULT_L, DEFAULT_O, DEFAULT_OU, DEFAULT_ST } = require("../constants/config/Cert");

const { setGlobalConfig, getGlobalConfig } = require("../service/global_config");
const logger = require("./logger");

const makeNumberPositive = (hexString) => {
  let mostSignificativeHexDigitAsInt = parseInt(hexString[0], 16);

  if (mostSignificativeHexDigitAsInt < 8) return hexString;

  mostSignificativeHexDigitAsInt -= 8;
  return mostSignificativeHexDigitAsInt.toString() + hexString.substring(1);
};

// Generate a random serial number for the Certificate
const randomSerialNumber = () => {
  return makeNumberPositive(forge.util.bytesToHex(forge.random.getBytesSync(20)));
};

// Get the Not Before Date for a Certificate (will be valid from 2 days ago)
const getCertNotBefore = () => {
  let twoDaysAgo = new Date(Date.now() - 60 * 60 * 24 * 2 * 1000);
  let year = twoDaysAgo.getFullYear();
  let month = (twoDaysAgo.getMonth() + 1).toString().padStart(2, "0");
  let day = twoDaysAgo.getDate();
  return new Date(`${year}-${month}-${day} 00:00:00Z`);
};

// Get Certificate Expiration Date (Valid for 90 Days by default)
const getCertNotAfter = (notBefore, expireInMonths) => {
  let ninetyDaysLater = new Date(
    notBefore.getTime() + (expireInMonths ? expireInMonths * 60 * 60 * 24 * 30 * 1000 : 60 * 60 * 24 * 90 * 1000)
  );
  let year = ninetyDaysLater.getFullYear();
  let month = (ninetyDaysLater.getMonth() + 1).toString().padStart(2, "0");
  let day = ninetyDaysLater.getDate();
  return new Date(`${year}-${month}-${day} 23:59:59Z`);
};

// Get CA Expiration Date (Valid for 100 Years)
const getCANotAfter = (notBefore) => {
  let year = notBefore.getFullYear() + 100;
  let month = (notBefore.getMonth() + 1).toString().padStart(2, "0");
  let day = notBefore.getDate();
  return new Date(`${year}-${month}-${day} 23:59:59Z`);
};

class CertificateGeneration {
  static rootCA = undefined;
  /**
   * Load root CA from file system and save into database
   * @returns true if must call wafService.applySgCertConfig(), false otherwise.
   */
  static async LoadRootCA() {
    let bRet = false;
    if (undefined !== this.rootCA) return bRet;
    let rootCA = await getGlobalConfig("sg_certs");
    let isNew = false;
    if (!rootCA || !rootCA.certificate || !rootCA.privateKey) {
      isNew = true;
    }
    const sTempCertDir = `${os.homedir()}/sg_certs/root`;
    if (!fs.existsSync(sTempCertDir)) {
      fs.mkdirSync(sTempCertDir, { recursive: true });
    }
    const certificatePath = sTempCertDir + "/certificate.pem";
    const privateKeyPath = sTempCertDir + "/privateKey.pem";
    let certificate, privateKey;

    if (isNew) {
      logger.warn(`Root CA not found, creating a new root CA...`);
      rootCA = this.CreateRootCA();
      bRet = await setGlobalConfig("sg_certs", {
        certificate,
        privateKey,
      });
    }
    certificate = rootCA.certificate;
    privateKey = rootCA.privateKey;

    // No need to save in file, only for checking certs with files.
    if (!fs.existsSync(certificatePath)) {
      fs.writeFileSync(certificatePath, certificate);
    }
    if (!fs.existsSync(privateKeyPath)) {
      fs.writeFileSync(privateKeyPath, privateKey);
    }

    this.rootCA = rootCA;
    return bRet;
  }

  static CreateRootCA() {
    // Create a new Keypair for the Root CA
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(4096);

    // Define the attributes for the new Root CA
    const attributes = [
      {
        shortName: "C",
        value: DEFAULT_C,
      },
      {
        shortName: "ST",
        value: DEFAULT_ST,
      },
      {
        shortName: "L",
        value: DEFAULT_L,
      },
      {
        shortName: "O",
        value: DEFAULT_O,
      },
      {
        shortName: "CN",
        value: DEFAULT_CN,
      },
      {
        shortName: "OU",
        value: DEFAULT_OU,
      },
    ];

    const extensions = [
      {
        name: "basicConstraints",
        cA: true,
      },
      {
        name: "keyUsage",
        keyCertSign: true,
        cRLSign: true,
      },
    ];

    // Create an empty Certificate
    const cert = forge.pki.createCertificate();

    // Set the Certificate attributes for the new Root CA
    cert.publicKey = publicKey;
    cert.privateKey = privateKey;
    cert.serialNumber = randomSerialNumber();
    cert.validity.notBefore = getCertNotBefore();
    cert.validity.notAfter = getCANotAfter(cert.validity.notBefore);
    cert.setSubject(attributes);
    cert.setIssuer(attributes);
    cert.setExtensions(extensions);

    // Self-sign the Certificate
    cert.sign(privateKey, forge.md.sha512.create());

    // Convert to PEM format
    const pemCert = forge.pki.certificateToPem(cert);
    const pemKey = forge.pki.privateKeyToPem(privateKey);

    // Return the PEM encoded cert and private key
    return {
      certificate: pemCert,
      privateKey: pemKey,
      notBefore: cert.validity.notBefore,
      notAfter: cert.validity.notAfter,
    };
  }

  static async CreateHostCert(hostCertCN, validDomains, expireInMonths) {
    await this.LoadRootCA();
    const rootCAObject = this.rootCA;
    if (!hostCertCN.toString().trim()) throw new Error('"hostCertCN" must be a String');
    if (!Array.isArray(validDomains)) throw new Error('"validDomains" must be an Array of Strings');
    if (!rootCAObject || !rootCAObject.hasOwnProperty("certificate") || !rootCAObject.hasOwnProperty("privateKey"))
      throw new Error('"rootCAObject" must be an Object with the properties "certificate" & "privateKey"');

    // Convert the Root CA PEM details, to a forge Object
    let caCert = forge.pki.certificateFromPem(rootCAObject.certificate);
    let caPrivateKey = forge.pki.privateKeyFromPem(rootCAObject.privateKey);

    // Create a new Keypair for the Host Certificate
    const hostKeys = forge.pki.rsa.generateKeyPair(4096);

    // Define the attributes/properties for the Host Certificate
    const attributes = [
      {
        shortName: "C",
        value: DEFAULT_C,
      },
      {
        shortName: "ST",
        value: DEFAULT_ST,
      },
      {
        shortName: "L",
        value: DEFAULT_L,
      },
      {
        shortName: "O",
        value: DEFAULT_O,
      },
      {
        shortName: "OU",
        value: DEFAULT_OU,
      },
      {
        shortName: "CN",
        value: `*.${hostCertCN}`,
      },
    ];

    const extensions = [
      {
        name: "basicConstraints",
        cA: false,
      },
      {
        name: "nsCertType",
        server: true,
      },
      {
        name: "subjectKeyIdentifier",
      },
      {
        name: "authorityKeyIdentifier",
        authorityCertIssuer: true,
        serialNumber: caCert.serialNumber,
      },
      {
        name: "keyUsage",
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
      },
      {
        name: "extKeyUsage",
        serverAuth: true,
      },
      {
        name: "subjectAltName",
        altNames: validDomains.map((domain) => {
          return { type: 2, value: domain };
        }),
      },
    ];

    // Create an empty Certificate
    let newHostCert = forge.pki.createCertificate();

    // Set the attributes for the new Host Certificate
    newHostCert.publicKey = hostKeys.publicKey;
    newHostCert.serialNumber = randomSerialNumber();
    newHostCert.validity.notBefore = getCertNotBefore();
    newHostCert.validity.notAfter = getCertNotAfter(newHostCert.validity.notBefore, expireInMonths);
    newHostCert.setSubject(attributes);
    newHostCert.setIssuer(caCert.subject.attributes);
    newHostCert.setExtensions(extensions);

    // Sign the new Host Certificate using the CA
    newHostCert.sign(caPrivateKey, forge.md.sha512.create());

    // Convert to PEM format
    let pemHostCert = forge.pki.certificateToPem(newHostCert);
    let pemHostKey = forge.pki.privateKeyToPem(hostKeys.privateKey);

    const sTempCertDir = `${os.homedir()}/sg_certs/${hostCertCN}`;
    if (!fs.existsSync(sTempCertDir)) {
      fs.mkdirSync(sTempCertDir, { recursive: true });
    }
    const certificatePath = sTempCertDir + "/certificate.pem";
    const privateKeyPath = sTempCertDir + "/privateKey.pem";
    fs.writeFileSync(certificatePath, pemHostCert);
    fs.writeFileSync(privateKeyPath, pemHostKey);

    return {
      certificate: pemHostCert,
      fullchain: pemHostCert + rootCAObject.certificate,
      privateKey: pemHostKey,
      notAfter: newHostCert.validity.notBefore,
      notAfter: newHostCert.validity.notAfter,
    };
  }
}

function CreateCSR(csrCN) {
  if (!csrCN.toString().trim()) {
    throw new Error('"csrCN" must be a String');
  }

  // generate a key pair
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(4096);

  // create a certification request (CSR)
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = publicKey;
  csr.setSubject([
    {
      shortName: "C",
      value: DEFAULT_C,
    },
    {
      shortName: "ST",
      value: DEFAULT_ST,
    },
    {
      shortName: "L",
      value: DEFAULT_L,
    },
    {
      shortName: "O",
      value: DEFAULT_O,
    },
    {
      shortName: "OU",
      value: DEFAULT_OU,
    },
    {
      shortName: "CN",
      value: csrCN,
    },
  ]);

  /*
    // set (optional) attributes
    csr.setAttributes([
        {
            name: "challengePassword",
            value: "password",
        },
        {
            name: "unstructuredName",
            value: "My Company, Inc.",
        },
        {
            name: "extensionRequest",
            extensions: [
                {
                    name: "subjectAltName",
                    altNames: [
                        {
                            // 2 is DNS type
                            type: 2,
                            value: "localhost",
                        },
                        {
                            type: 2,
                            value: "127.0.0.1",
                        },
                        {
                            type: 2,
                            value: "www.domain.net",
                        },
                    ],
                },
            ],
        },
    ]);
    */

  // sign certification request
  csr.sign(privateKey);

  // verify certification request
  return {
    csr: forge.pki.certificationRequestToPem(csr),
    privateKey: forge.pki.privateKeyToPem(privateKey),
  };
}

function publicKeyFromPem(pem) {
  let pki = forge.pki;
  let publicKey = pki.publicKeyFromPem(pem);
  return publicKey;
}

function privateKeyFromPem(pem) {
  let pki = forge.pki;
  let publicKey = pki.privateKeyFromPem(pem);
  return publicKey;
}

function certificateFromPem(pem) {
  let pki = forge.pki;
  let cert = pki.certificateFromPem(pem);
  return cert;
}

function basicCertDetails(cert) {
  if (!cert) return null;
  const retCerts = {};
  const subject = cert.subject.attributes.map((attr) => ("CN" === attr.shortName ? attr.value : "")).join(", ");

  retCerts.host = subject;
  retCerts.validTo = cert.validity?.notAfter;
  return retCerts;
}

function isValidCert(crt_pem, bPublic) {
  try {
    let cert = undefined;
    if (bPublic) {
      cert = certificateFromPem(crt_pem);
      // cert = crypto.createPublicKey({ key: crt_pem, format: "pem" });
    } else {
      cert = privateKeyFromPem(crt_pem);
      // cert = crypto.createPrivateKey({ key: crt_pem, format: "pem" });
    }
    if (undefined === cert) return false;
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  CertificateGeneration,
  publicKeyFromPem,
  privateKeyFromPem,
  certificateFromPem,
  isValidCert,
  basicCertDetails,
  CreateCSR,
};
