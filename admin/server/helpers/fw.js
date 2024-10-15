const { ExpressionCondition, ExpressionKeyTitle, ExpressionKeyField } = require("../constants/config/Fw");

function getFieldsFromConditions(conditions) {
  let fields = [];
  for (let or_condition of conditions) {
    if ("object" !== typeof or_condition || !Array.isArray(or_condition) || 1 > or_condition.length) {
      return null;
    }
    let and_conditions = or_condition;
    if ("object" !== typeof and_conditions || !Array.isArray(and_conditions) || 1 > and_conditions.length) {
      return null;
    }
    for (let and_condition of and_conditions) {
      let condition = and_condition;
      if (3 !== Object.keys(condition).length) return null;
      let key = condition["key"];
      if (undefined === ExpressionKeyTitle[key]) {
        return null;
      }
      let cond_operator = condition["condition"];
      let value = condition["value"];
      if (undefined === value || undefined === cond_operator) {
        return null;
      }
      if (!Object.values(ExpressionCondition).includes(cond_operator)) {
        return null;
      }
      // fields.push(ExpressionKeyTitle[key]);
      fields.push(key);
    }
  }
  // Remove duplicated ones
  fields = Array.from(new Set(fields));
  return fields;
}

function isValidFwRuleCondition(conditions, allowEmpty = false) {
  for (let or_condition of conditions) {
    if ("object" !== typeof or_condition || !Array.isArray(or_condition)) {
      return false;
    }
    if (1 > or_condition.length) {
      if (false === allowEmpty) {
        return false;
      } else {
        continue;
      }
    }
    let and_conditions = or_condition;
    if ("object" !== typeof and_conditions || !Array.isArray(and_conditions) || 1 > and_conditions.length) {
      return false;
    }
    for (let and_condition of and_conditions) {
      let condition = and_condition;
      if (3 !== Object.keys(condition).length) return false;
      let key = condition["key"];
      if (undefined === ExpressionKeyTitle[key]) {
        return false;
      }
      let cond_operator = condition["condition"];
      let value = condition["value"];
      if (undefined === value || undefined === cond_operator) {
        return false;
      }
      if (!Object.values(ExpressionCondition).includes(cond_operator)) {
        return false;
      }
      switch (key) {
        case ExpressionKeyField.SOURCE_IP:
        case ExpressionKeyField.COUNTRY:
          if (![ExpressionCondition.EQUALS, ExpressionCondition.NOT_EQUALS].includes(cond_operator)) {
            return false;
          }
          break;
        case ExpressionKeyField.HOST_NAME:
        case ExpressionKeyField.URI:
        case ExpressionKeyField.QUERY:
        case ExpressionKeyField.HEADER:
        case ExpressionKeyField.USER_AGENT:
        case ExpressionKeyField.REFERER:
        case ExpressionKeyField.COOKIE:
        case ExpressionKeyField.METHOD:
        case ExpressionKeyField.CITY_NAME:
        case ExpressionKeyField.JA3_FINGERPRINT:
          if (
            ![
              ExpressionCondition.EQUALS,
              ExpressionCondition.NOT_EQUALS,
              ExpressionCondition.CONTAINS,
              ExpressionCondition.NOT_CONTAINS,
            ].includes(cond_operator)
          ) {
            return false;
          }
          break;
        case ExpressionKeyField.BOT_SCORE:
        case ExpressionKeyField.AS_NUMBER:
          if (
            ![
              ExpressionCondition.EQUALS,
              ExpressionCondition.NOT_EQUALS,
              ExpressionCondition.GREATER_THAN,
              ExpressionCondition.LESS_THAN,
              ExpressionCondition.GREATER_THAN_OR_EQUALS_TO,
              ExpressionCondition.LESS_THAN,
            ].includes(cond_operator)
          ) {
            return false;
          }
          // value should be a number
          if (isNaN(value)) {
            return false;
          }
          break;
        default:
          return false;
      }
    }
  }
  return true;
}

module.exports = { getFieldsFromConditions, isValidFwRuleCondition };
