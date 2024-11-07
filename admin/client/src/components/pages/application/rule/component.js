import React from "react";

import { Select, Autocomplete, Box, TextField, Typography, Grid } from "@mui/material";
import {
  ExpressionKeyField,
  FirewallAction,
  FireWallExpressionCondition,
  getExpressionKeyTitle,
  UserRole,
} from "../../../../utils/constants";
import countries from "./countries";
import { AndBox, MenuItem } from "../common/styled";

function KeyComponent({ keyStr, selectKeyStr, padx, pady, advanced }) {
  const aKeys = [
    ExpressionKeyField.SOURCE_IP,
    ExpressionKeyField.HOST_NAME,
    ExpressionKeyField.USER_AGENT,
    ExpressionKeyField.HEADER,
    ExpressionKeyField.QUERY,
    ExpressionKeyField.COOKIE,
    ExpressionKeyField.URI,
    ExpressionKeyField.REFERER,
    ExpressionKeyField.METHOD,
  ];
  const aAdvancedKeys = [
    ExpressionKeyField.COUNTRY,
    ExpressionKeyField.CITY_NAME,
    ExpressionKeyField.AS_NUMBER,
    ExpressionKeyField.BOT_SCORE,
    ExpressionKeyField.AUTH_SCORE,
    ExpressionKeyField.JA3_FINGERPRINT,
  ];
  return (
    <Select value={keyStr} onChange={selectKeyStr} sx={{ width: "95%", border: "1px solid #515151" }}>
      {keyStr === ExpressionKeyField.NONE && (
        <MenuItem key={`_key0_${padx}_${pady}`} value={ExpressionKeyField.NONE} disabled sx={{ display: "none!important" }}>
          Select Field ...
        </MenuItem>
      )}
      {aKeys.map((keyValue, keyIdx) => (
        <MenuItem key={`_key${keyIdx + 1}_${padx}_${pady}`} value={keyValue}>
          {getExpressionKeyTitle(keyValue)}
        </MenuItem>
      ))}
      {(undefined === advanced || true === advanced) &&
        aAdvancedKeys.map((keyValue, keyIdx) => (
          <MenuItem key={`_key${keyIdx + 1 + aKeys.length}_${padx}_${pady}`} value={keyValue}>
            {getExpressionKeyTitle(keyValue)}
          </MenuItem>
        ))}
    </Select>
  );
}

function getConditionTitle(cond) {
  switch (cond) {
    case FireWallExpressionCondition.EQUALS:
      return "Equals";
    case FireWallExpressionCondition.NOT_EQUALS:
      return "Does not Equal";
    case FireWallExpressionCondition.CONTAINS:
      return "Contains";
    case FireWallExpressionCondition.NOT_CONTAINS:
      return "Does not Contain";
    case FireWallExpressionCondition.GREATER_THAN:
      return "Greater than";
    case FireWallExpressionCondition.LESS_THAN:
      return "Less than";
    case FireWallExpressionCondition.GREATER_THAN_OR_EQUALS_TO:
      return "Greater than OR equals to";
    case FireWallExpressionCondition.LESS_THAN_OR_EQUALS_TO:
      return "Less than OR equals to";
    default:
      return "Unknown";
  }
}

function CondComponent({ condStr, selectCondStr, disableMenu, disabled, padx, pady }) {
  // Order should NOT be modified
  const aConditions = [
    FireWallExpressionCondition.EQUALS,
    FireWallExpressionCondition.NOT_EQUALS,
    FireWallExpressionCondition.CONTAINS,
    FireWallExpressionCondition.NOT_CONTAINS,
    FireWallExpressionCondition.GREATER_THAN,
    FireWallExpressionCondition.LESS_THAN,
    FireWallExpressionCondition.GREATER_THAN_OR_EQUALS_TO,
    FireWallExpressionCondition.LESS_THAN_OR_EQUALS_TO,
  ];
  // switch
  return (
    <Select disabled={disabled} value={condStr} onChange={selectCondStr} sx={{ width: "95%", border: "1px solid #515151" }}>
      {condStr === "none" && (
        <MenuItem key={"_cond0_" + padx + "_" + pady} value="none" disabled sx={{ display: "none!important" }}>
          Select Item ...
        </MenuItem>
      )}
      {aConditions.map((condValue, condIdx) => {
        if (!disableMenu[condIdx]) return <></>;
        return (
          <MenuItem key={`_cond${condIdx + 1}_${padx}_${pady}`} value={condValue}>
            {getConditionTitle(condValue)}
          </MenuItem>
        );
      })}
    </Select>
  );
}
function MethodValueComponent({ valueStr, selectValueStr, disabled, padx, pady }) {
  const aMethods = ["GET", "POST", "HEAD", "PUT", "DELETE", "PATCH", "TRACE", "CONNECT"];
  return (
    <Select disabled={disabled} value={valueStr} onChange={selectValueStr} sx={{ width: "95%", border: "1px solid #515151" }}>
      {valueStr === "none" && (
        <MenuItem key={"_cond0_" + padx + "_" + pady} value="none" disabled sx={{ display: "none!important" }}>
          Select Item ...
        </MenuItem>
      )}
      {aMethods.map((methodValue, methodIdx) => (
        <MenuItem key={`_cond${methodIdx + 1}_${padx}_${pady}`} value={methodValue}>
          {methodValue}
        </MenuItem>
      ))}
    </Select>
  );
}
function CountryValueComponent({ valueStr, selectValueStr, disabled }) {
  const getName = (code) => {
    let label;
    countries?.forEach((country) => {
      if (country?.value === code) label = country?.label;
    });
    return label;
  };
  return (
    <Autocomplete
      options={countries}
      sx={{ width: "95%", border: "1px solid #515151", borderRadius: "8px" }}
      autoHighlight
      disabled={disabled}
      onChange={selectValueStr}
      value={getName(valueStr)}
      renderOption={(props, option) => (
        <Box component="option" value={option.value} {...props}>
          {option.label} ({option.value})
        </Box>
      )}
      renderInput={(params) => <TextField {...params} placeholder="Select a country" />}
    />
  );
}
function ValueComponent({ keyStr, valueStr, selectValueStr, disabled, padx, pady }) {
  let isNumber = false;
  switch (keyStr) {
    case ExpressionKeyField.AS_NUMBER:
    case ExpressionKeyField.BOT_SCORE:
    case ExpressionKeyField.AUTH_SCORE_SCORE:
      isNumber = true;
      break;
    default:
      isNumber = false;
      break;
  }
  const type = isNumber ? "number" : "text";
  return <TextField fullWidth type={type} value={valueStr} disabled={disabled} onChange={selectValueStr} key={`_value_${padx}_${pady}`} />;
}

function getValidCondFlag(key) {
  const condFlag = {
    src_ip: [true, true, false, false, false, false, false, false],
    method: [true, true, false, false, false, false, false, false],
    host_name: [true, true, true, true, false, false, false, false],
    ua: [true, true, true, true, false, false, false, false],
    header: [true, true, true, true, false, false, false, false],
    query: [true, true, true, true, false, false, false, false],
    cookie: [true, true, true, true, false, false, false, false],
    uri: [true, true, true, true, false, false, false, false],
    referer: [true, true, true, true, false, false, false, false],
    country: [true, true, false, false, false, false, false, false],
    city: [true, true, true, true, false, false, false, false],
    asn: [true, true, false, false, true, true, true, true],
    ja3_fingerprint: [true, true, true, true, false, false, false, false],
    bot_score: [true, true, false, false, true, true, true, true],
    auth_score: [true, true, false, false, true, true, true, true],
    none: [true, true, false, false, false, false, false, false],
  };
  if (key in condFlag) {
    return condFlag[key];
  } else {
    return condFlag.none;
  }
}

function AndComponent() {
  return (
    <Grid item xs={12}>
      <Box
        sx={{
          height: "8px",
          width: "0px",
          borderLeft: "solid 1px #444",
          marginLeft: "30px",
        }}
      />
      <AndBox>
        <Typography>And</Typography>
      </AndBox>
      <Box
        sx={{
          height: "8px",
          width: "0px",
          borderLeft: "solid 1px #444",
          marginLeft: "30px",
        }}
      />
    </Grid>
  );
}

function ActionComponent({ userRole, action, setAction }) {
  return (
    <Select
      value={action}
      onChange={(event) => {
        if (userRole === UserRole.READONLY_USER) return;
        setAction(event.target.value);
      }}
      sx={{ width: "95%" }}
    >
      <MenuItem key={"action_0"} value={FirewallAction.LOG}>
        Log
      </MenuItem>
      <MenuItem key={"action_1"} value={FirewallAction.BYPASS}>
        Bypass
      </MenuItem>
      <MenuItem key={"action_2"} value={FirewallAction.ALLOW}>
        Allow
      </MenuItem>
      <MenuItem key={"action_3"} value={FirewallAction.CHALLENGE}>
        Challenge
      </MenuItem>
      <MenuItem key={"action_4"} value={FirewallAction.BLOCK}>
        Block
      </MenuItem>
      {/* <MenuItem key={"action_5"} value={FirewallAction.DROP}>
                Drop
            </MenuItem> */}
    </Select>
  );
}
export {
  getConditionTitle,
  KeyComponent,
  CondComponent,
  MethodValueComponent,
  CountryValueComponent,
  ValueComponent,
  getValidCondFlag,
  AndComponent,
  ActionComponent,
};
