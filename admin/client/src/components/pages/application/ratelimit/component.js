import React from "react";

import { Select, TextField } from "@mui/material";
import { FirewallAction, RateLimitCharacteristicKey, UserRole } from "../../../../utils/constants";
import { MenuItem } from "../common/styled";

function CharacteristicsKeyComponent({ keyStr, selectKeyStr, padx, pady, advanced }) {
  return (
    <Select value={keyStr} onChange={selectKeyStr} sx={{ width: "95%" }}>
      {keyStr === "none" && (
        <MenuItem key={"_characteristics0_" + padx + "_" + pady} value="none" disabled sx={{ display: "none!important" }}>
          Select Field ...
        </MenuItem>
      )}
      <MenuItem key={"_characteristics1_" + padx + "_" + pady} value={RateLimitCharacteristicKey.IP}>
        IP
      </MenuItem>
      {true === advanced && (
        <MenuItem key={"_characteristics2_" + padx + "_" + pady} value={RateLimitCharacteristicKey.IP_WITH_NAT}>
          IP with NAT support
        </MenuItem>
      )}
      {true === advanced && (
        <MenuItem key={"_characteristics3_" + padx + "_" + pady} value={RateLimitCharacteristicKey.QUERY}>
          Query
        </MenuItem>
      )}
      {true === advanced && (
        <MenuItem key={"_characteristics4_" + padx + "_" + pady} value={RateLimitCharacteristicKey.HEADERS}>
          Headers
        </MenuItem>
      )}

      {true === advanced && (
        <MenuItem key={"_characteristics5_" + padx + "_" + pady} value={RateLimitCharacteristicKey.COOKIE}>
          Cookie
        </MenuItem>
      )}

      {true === advanced && (
        <MenuItem key={"_characteristics6_" + padx + "_" + pady} value={RateLimitCharacteristicKey.ASN}>
          ASN
        </MenuItem>
      )}

      {true === advanced && (
        <MenuItem key={"_characteristics7_" + padx + "_" + pady} value={RateLimitCharacteristicKey.COUNTRY}>
          Country
        </MenuItem>
      )}

      {true === advanced && (
        <MenuItem key={"_characteristics8_" + padx + "_" + pady} value={RateLimitCharacteristicKey.JA3_FINGERPRINT}>
          JA3 Fingerprint*
        </MenuItem>
      )}
    </Select>
  );
}
function CharacteristicsValueComponent({ valueStr, selectValueStr, disabled, pady }) {
  return (
    <TextField fullWidth value={valueStr} disabled={disabled} onChange={selectValueStr} key={"_characteristics_value_" + pady}></TextField>
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
      <MenuItem key={"action_3"} value={FirewallAction.CHALLENGE}>
        Challenge
      </MenuItem>
      <MenuItem key={"action_4"} value={FirewallAction.BLOCK}>
        Block
      </MenuItem>
      <MenuItem key={"action_5"} value={FirewallAction.DROP}>
        Drop
      </MenuItem>
    </Select>
  );
}
export { CharacteristicsKeyComponent, CharacteristicsValueComponent, ActionComponent };
