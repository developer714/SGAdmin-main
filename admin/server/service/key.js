const forge = require("node-forge");

const { APIKeyPermissions, APIKeyState } = require("../constants/Api");
const { ApiKeyModel } = require("../models/ApiKeys");

async function getKeys(user) {
  const keys = await ApiKeyModel.find({ user: user._id });
  // Change the status of expired keys
  await Promise.all(
    keys.map(async (key) => {
      if (Date.now() >= key.expires_at) {
        key.status = APIKeyState.EXPIRED;
        return await key.save();
      }
    })
  );
  const key_info = APIKeyPermissions;
  delete key_info.NOT_ALLOWED;
  return { keys, key_info: APIKeyPermissions };
}

async function createKey(user, data) {
  // console.log(data);
  // console.log(user);
  while (true) {
    let key = forge.util.bytesToHex(forge.random.getBytes(32));

    if (await ApiKeyModel.findOne({ key })) continue;

    let permissions = data.permissions;
    permissions.sort((a, b) => a - b);
    permissions = permissions.filter((perm, idx, arr) => arr.indexOf(perm) === idx);
    while (permissions[0] < 0) permissions.splice(0, 1);

    const created_at = Date.now();
    const expires_at = created_at + data.duration * 24 * 60 * 60 * 1000;
    const apiKey = new ApiKeyModel({
      user: user._id,
      name: data.name,
      key: key,
      permissions,
      duration: data.duration,
      expires_at,
    });

    await apiKey.save();

    return await getKeys(user);
  }
}

async function updateKey(user, key_id, data) {
  const apiKey = await ApiKeyModel.findById(key_id);

  if (!apiKey || apiKey.user.toString() !== user._id.toString()) throw "No API key found.";

  if (apiKey.status !== APIKeyState.ACTIVE) throw "Can't update inactive key.";

  // delete readonly fields
  delete data._id;
  delete data.key;
  delete data.user;
  delete data.created_at;
  delete data.expires_at;
  delete data.revoked_at;

  if (data.permissions) {
    // unique and remove invalid permission values
    data.permissions.sort((a, b) => a - b);
    data.permissions = data.permissions.filter((perm, idx, arr) => arr.indexOf(perm) === idx);
    while (data.permissions[0] < 0) data.permissions.splice(0, 1);
  }

  if (data.duration !== undefined) {
    data.expires_at = apiKey.created_at.getTime() + data.duration * 86400000;
  }

  if (data.status === APIKeyState.REVOKED) {
    data.revoked_at = Date.now();
  }

  await ApiKeyModel.findByIdAndUpdate(key_id, data);

  return await getKeys(user);
}

module.exports = { getKeys, createKey, updateKey };
