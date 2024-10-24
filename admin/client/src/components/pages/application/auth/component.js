import React from "react";

import { Select } from "@mui/material";
import { MenuItem } from "../common/styled";
import { ExpressionKeyField, getExpressionKeyTitle } from "../../../../utils/constants";

function KeyComponent({ keyStr, selectKeyStr, padx, pady }) {
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
    ExpressionKeyField.COUNTRY,
    ExpressionKeyField.CITY_NAME,
    ExpressionKeyField.AS_NUMBER,
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
    </Select>
  );
}

export { KeyComponent };
