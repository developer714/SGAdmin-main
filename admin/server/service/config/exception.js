const { SiteModel } = require("../../models/Site");
const { WafExceptionModel } = require("../../models/WafException");
const { NotFoundError } = require("../../middleware/error-handler");
const { getFieldsFromConditions, isValidFwRuleCondition } = require("../../helpers/fw");

async function checkExceptionOwnership(site_uid, exception_id) {
  const site = await SiteModel.findById(site_uid);
  const exception = await WafExceptionModel.findById(exception_id);
  if (!exception) {
    throw NotFoundError(`Exception '${exception_id}' not found`);
  }
  if (exception.site_id.toString() !== site._id.toString()) {
    throw NotFoundError(`Exception '${exception_id}' not found in the site '${site.site_id}'`);
  }
  return exception;
}

async function getExceptions(site_uid) {
  const site = await SiteModel.findById(site_uid).populate({
    path: "waf_exceptions",
    options: { sort: { seq_no: 1 } },
  });

  let excs = [];
  for (const origin_exc of site.waf_exceptions) {
    const { id, enabled, name, skip_rule_type, skip_secrule_ids, created_at } = origin_exc;
    let fields = getFieldsFromConditions(origin_exc.conditions);
    let exc = {
      id,
      enabled,
      name,
      fields,
      skip_rule_type,
      skip_secrule_ids,
      created_at,
    };
    excs.push(exc);
  }
  return excs;
}

async function getException(site_uid, exception_id) {
  const exception = await checkExceptionOwnership(site_uid, exception_id);
  await exception.populate("skip_secrules");
  return exception;
}

async function getLastSeqNo(site) {
  const lastExceptionRule = await WafExceptionModel.findOne({
    site_id: site._id,
  }).sort({
    seq_no: 1,
  });
  if (!lastExceptionRule) return 0;
  return lastExceptionRule.seq_no;
}

async function createException(site_uid, params) {
  const { name, conditions, skip_rule_type, skip_secrule_ids } = params;

  if (!isValidFwRuleCondition(conditions)) {
    throw `Invalid exception condition ${JSON.stringify(conditions)}`;
  }

  const site = await SiteModel.findById(site_uid);
  const lastSeqNo = await getLastSeqNo(site);
  const newException = new WafExceptionModel({
    site_id: site._id,
    name,
    conditions,
    skip_rule_type,
    skip_secrule_ids,
    seq_no: lastSeqNo + 1,
  });
  await newException.save();
  return newException;
}

async function updateException(site_uid, exception_id, params) {
  const { enabled, name, conditions, skip_rule_type, skip_secrule_ids } = params;

  const exception = await checkExceptionOwnership(site_uid, exception_id);
  if (undefined !== enabled) exception.enabled = enabled;
  if (undefined !== name) exception.name = name;
  if (undefined !== conditions) {
    if (!isValidFwRuleCondition(conditions)) {
      throw `Invalid exception condition ${conditions}`;
    }

    exception.conditions = conditions;
  }
  if (undefined !== skip_rule_type) exception.skip_rule_type = skip_rule_type;
  if (undefined !== skip_secrule_ids) exception.skip_secrule_ids = skip_secrule_ids;
  await exception.save();
  return exception;
}

async function deleteException(site_uid, exception_id) {
  let exception_ids = [];
  if ("string" === typeof exception_id) {
    exception_ids = [exception_id];
  } else {
    exception_ids = exception_id;
  }

  await Promise.all(
    exception_ids.map(async (exception_id) => {
      const exception = await checkExceptionOwnership(site_uid, exception_id);
      await WafExceptionModel.findByIdAndDelete(exception._id);
    })
  );
}

async function saveExceptionsOrder(site_uid, exception_ids) {
  const site = await SiteModel.findById(site_uid);
  // Reset all sequence numbers included in the current site.
  await WafExceptionModel.updateMany({ site_id: site._id }, { seq_no: 0 });
  await site.populate("waf_exceptions");
  let seq_no = 0;
  await Promise.all(
    exception_ids.map(async (exception_id) => {
      const exception = site.waf_exceptions.find((_exception) => _exception.id === exception_id);
      if (!exception) {
        throw NotFoundError(`No exception rule '${exception_id}' found in site '${site.site_id}'`);
      }
      seq_no += 1;
      exception.seq_no = seq_no;
      await exception.save();
    })
  );
  // Set sequence numbers of unset rules.
  const exceptionsNotset = await WafExceptionModel.find({
    $and: [{ site_id: site._id }, { seq_no: { $in: [0, undefined] } }],
  }).sort({ created_at: -1 });
  if (exceptionsNotset && 0 < exceptionsNotset.length) {
    for (const exceptionNotset of exceptionsNotset) {
      seq_no += 1;
      exceptionNotset.seq_no = seq_no;
      await exceptionNotset.save();
    }
  }
}

module.exports = {
  getExceptions,
  getException,
  createException,
  updateException,
  deleteException,
  saveExceptionsOrder,
};
