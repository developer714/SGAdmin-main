import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Checkbox, Chip, FormControlLabel, Grid, Select, TextField, Typography } from "@mui/material";
import { RuleAction, RuleKeyField, RuleOperator, RuleTransformation, getRuleKeyTitle } from "../../../../../../utils/constants";
import { Divider, IconButton, MenuItem } from "../../../common/styled";
import CancelIcon from "@mui/icons-material/Cancel";
import { ReactComponent as ArrowDownIcon } from "../../../../../../vendor/arrow_down.svg";
import { ReactComponent as ArrowUpIcon } from "../../../../../../vendor/arrow_up.svg";

// function getMenuItemStyles(name, selectedItems, theme) {
//   return {
//     fontWeight: selectedItems.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium,
//   };
// }

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      // width: 960,
    },
  },
};

function CustomSelectBox({ keys, getTitle, values, selectValues, padx }) {
  const theme = useTheme();

  const [expanded, setExpanded] = useState(false);

  const handleDelete = (value) => {
    selectValues(
      values.filter((item) => item !== value),
      padx
    );
  };

  const handleToggle = (value) => {
    if (!!values.find((item) => item === value)) {
      selectValues(
        values.filter((item) => item !== value),
        padx
      );
    } else {
      selectValues(values.concat([value]), padx);
    }
  };

  return (
    <Box sx={{ width: "100%", background: "white", border: "1px solid #032142CC", borderRadius: "8px" }}>
      <Grid container>
        <Grid item xs={12} sx={{ minHeight: `${ITEM_HEIGHT}px` }}>
          <Grid container display="flex" alignItems="center">
            <Grid item xs padding={3}>
              {values.map((value) => {
                return (
                  <Chip
                    key={value}
                    label={getTitle(value)}
                    clickable
                    deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                    onDelete={() => handleDelete(value)}
                    onClick={() => handleDelete(value)}
                    sx={{ background: theme.palette.custom.yellow.opacity_80, margin: "2px 3px" }}
                  />
                );
              })}
            </Grid>
            <Grid item>
              <IconButton onClick={() => setExpanded(!expanded)}>{expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}</IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        {keys.map((key) => {
          return (
            <Grid item xs={6} md={3} sx={{ display: expanded ? "block" : "none" }}>
              <FormControlLabel
                control={<Checkbox color="primary" checked={!!values.find((value) => value === key)} onClick={(e) => handleToggle(key)} />}
                label={getTitle(key)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
function VariableComponent({ variables, selectVariables, padx }) {
  const aKeys = [
    RuleKeyField.SOURCE_IP,
    RuleKeyField.HOST_NAME,
    RuleKeyField.USER_AGENT,
    RuleKeyField.REQUEST_HEADERS,
    RuleKeyField.REQUEST_HEADER_NAMES,
    RuleKeyField.ARGS,
    RuleKeyField.ARGS_NAMES,
    RuleKeyField.COOKIE,
    RuleKeyField.COOKIE_NAME,
    RuleKeyField.URI,
    RuleKeyField.URI_PATH,
    RuleKeyField.QUERY,
    RuleKeyField.METHOD,
    RuleKeyField.REQUEST_BODY,
    RuleKeyField.REQUEST_BODY_LENGTH,
  ];

  return CustomSelectBox({
    keys: aKeys,
    getTitle: getRuleKeyTitle,
    values: variables,
    selectValues: selectVariables,
    padx,
  });

  // const [selectedItems, setSelectedItems] = React.useState(null);

  // const handleDelete = (e, value) => {
  //   e.preventDefault();
  //   setSelectedItems((current) => _without(current, value));
  // };
  // const handleChange = (event) => {
  //   const value = event.target.value;
  //   setSelectedItems(
  //     // On autofill we get a stringified value.
  //     typeof value === "string" ? value.split(",") : value
  //   );
  // };

  // React.useEffect(() => {
  //   if (null === selectedItems) {
  //     setSelectedItems(variables);
  //   }
  // }, [variables]); // eslint-disable-line react-hooks/exhaustive-deps

  // React.useEffect(() => {
  //   if (null !== selectedItems) {
  //     selectVariables(selectedItems, padx);
  //   }
  // }, [selectedItems, padx]); // eslint-disable-line react-hooks/exhaustive-deps

  // return (
  //   <FormControl fullWidth>
  //     {/* <InputLabel id="demo-multiple-chip-label">
  //               Search for a field
  //           </InputLabel> */}
  //     <Select
  //       labelId="demo-multiple-chip-label"
  //       id="demo-multiple-chip"
  //       multiple
  //       fullWidth
  //       value={variables}
  //       onChange={handleChange}
  //       renderValue={(selected) => (
  //         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
  //           {selected.map((value) => (
  //             <Chip
  //               key={value}
  //               label={getRuleKeyTitle(value)}
  //               clickable
  //               deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
  //               onDelete={(e) => handleDelete(e, value)}
  //               // onClick={() => console.log("clicked chip")}
  //             />
  //           ))}
  //         </Box>
  //       )}
  //       MenuProps={MenuProps}
  //     >
  //       {aKeys.map((keyValue, keyIdx) => (
  //         <MenuItem key={`_var${keyIdx + 1}_${padx}`} value={keyValue} style={getMenuItemStyles(keyValue, variables, theme)}>
  //           {getRuleKeyTitle(keyValue)}
  //         </MenuItem>
  //       ))}
  //     </Select>
  //   </FormControl>
  // );
}

function getOperatorTitle(cond, negative) {
  if (true === negative) {
    switch (cond) {
      case RuleOperator.EQUALS:
        return "Does not equal value";
      case RuleOperator.CONTAINS:
        return "Does not contain";
      case RuleOperator.PARTIAL_MATCH:
        return "Does not match substring in list";
      case RuleOperator.REG_EXP_MATCH:
        return "Does not match RegEx";
      case RuleOperator.BEGINS_WITH:
        return "Does not begin with";
      case RuleOperator.ENDS_WITH:
        return "Does not end with";
      case RuleOperator.MATCHES_IP:
        return "Does not match IP/CIDR list";
      default:
        return "Unknown";
    }
  } else {
    switch (cond) {
      case RuleOperator.DETECT_SQLI:
        return "Has SQL injection";
      case RuleOperator.DETECT_XSS:
        return "Has XSS injection";
      case RuleOperator.EQUALS:
        return "Equals value";
      case RuleOperator.CONTAINS:
        return "Contains";
      case RuleOperator.GREATER_THAN:
        return "Is greater than value";
      case RuleOperator.LESS_THAN:
        return "Less than value";
      case RuleOperator.GREATER_THAN_OR_EQUALS_TO:
        return "Is greater or equal to value";
      case RuleOperator.LESS_THAN_OR_EQUALS_TO:
        return "Less than or equal to value";
      case RuleOperator.PARTIAL_MATCH:
        return "Matches substring in list";
      case RuleOperator.REG_EXP_MATCH:
        return "Matches RegEx";
      case RuleOperator.BEGINS_WITH:
        return "Begins with";
      case RuleOperator.ENDS_WITH:
        return "Ends with";
      case RuleOperator.MATCHES_IP:
        return "Matches IP/CIDR list";
      default:
        return "Unknown";
    }
  }
}

function OperatorComponent({ operatorStr, selectOperatorStr, disabled, padx }) {
  // Order should NOT be modified
  const aConditions = [
    { operator: RuleOperator.DETECT_SQLI, negative: false },
    { operator: RuleOperator.DETECT_XSS, negative: false },
    { operator: RuleOperator.EQUALS, negative: false },
    { operator: RuleOperator.EQUALS, negative: true },
    { operator: RuleOperator.CONTAINS, negative: false },
    { operator: RuleOperator.CONTAINS, negative: true },
    { operator: RuleOperator.GREATER_THAN, negative: false },
    { operator: RuleOperator.LESS_THAN, negative: false },
    { operator: RuleOperator.GREATER_THAN_OR_EQUALS_TO, negative: false },
    { operator: RuleOperator.LESS_THAN_OR_EQUALS_TO, negative: false },
    { operator: RuleOperator.PARTIAL_MATCH, negative: false },
    { operator: RuleOperator.PARTIAL_MATCH, negative: true },
    { operator: RuleOperator.REG_EXP_MATCH, negative: false },
    { operator: RuleOperator.REG_EXP_MATCH, negative: true },
    { operator: RuleOperator.BEGINS_WITH, negative: false },
    { operator: RuleOperator.BEGINS_WITH, negative: true },
    { operator: RuleOperator.ENDS_WITH, negative: false },
    { operator: RuleOperator.ENDS_WITH, negative: true },
    { operator: RuleOperator.MATCHES_IP, negative: false },
    { operator: RuleOperator.MATCHES_IP, negative: true },
  ];
  // switch
  return (
    <Select
      disabled={disabled}
      value={operatorStr}
      onChange={selectOperatorStr}
      sx={{ minWidth: "360px", border: "1px solid #032142CC" }}
      MenuProps={MenuProps}
    >
      {operatorStr === RuleOperator.NONE && (
        <MenuItem key={`_operator0_${padx}`} value={RuleOperator.NONE} disabled sx={{ display: "none!important" }}>
          Select Item ...
        </MenuItem>
      )}
      {aConditions.map((condValue, condIdx) => {
        return (
          <MenuItem key={`_operator${condIdx + 1}_${padx}`} value={(condValue.negative ? "!" : "") + condValue.operator}>
            {getOperatorTitle(condValue.operator, condValue.negative)}
          </MenuItem>
        );
      })}
    </Select>
  );
}

function ValueComponent({ valueStr, selectValueStr, disabled, padx }) {
  return (
    <TextField
      fullWidth
      value={valueStr}
      disabled={disabled}
      onChange={(e) => selectValueStr(e.target.value, padx)}
      key={`_value_${padx}`}
    />
  );
}

function getTransformationTitle(t) {
  switch (t) {
    case RuleTransformation.NONE:
      return "None";
    case RuleTransformation.BASE64_DECODE:
      return "Base64 decode";
    case RuleTransformation.BASE64_ENCODE:
      return "Base64 encode";
    case RuleTransformation.HEX_DECODE:
      return "Hex decode";
    case RuleTransformation.HEX_ENCODE:
      return "Hex encode";
    case RuleTransformation.LOWERCASE:
      return "Lowercase";
    case RuleTransformation.REMOVE_NULLS:
      return "Remove NULLs";
    case RuleTransformation.REMOVE_WHITE_SPACE:
      return "Remove white space";
    case RuleTransformation.REPLACE_NULLS:
      return "Replace NULLs";
    case RuleTransformation.URL_DECODE:
      return "URL decode";
    case RuleTransformation.UPPERCASE:
      return "Uppercase";
    case RuleTransformation.URL_DECODE_UNI:
      return "URL decode uni";
    case RuleTransformation.URL_ENCODE:
      return "URL encode";
    case RuleTransformation.UTF8_TO_UNICODE:
      return "UTF8 to unicode";
    case RuleTransformation.TRIM_LEFT:
      return "Trim left";
    case RuleTransformation.TRIM_RIGHT:
      return "Trim right";
    case RuleTransformation.TRIM:
      return "Trim";
    case RuleTransformation.DECODE_HTML_ENTITY_ESCAPE:
      return "Decode HTML entity escape";
    case RuleTransformation.DECODE_JS_ESCAPE:
      return "Decode JS escape";
    case RuleTransformation.DECODE_CSS_ESCAPE:
      return "Decode CSS escape";
    case RuleTransformation.DECODE_CLI_ESCAPE:
      return "Decode CLI escape";
    case RuleTransformation.PATH_NORMALIZATION:
      return "Path normalization";
    case RuleTransformation.COMPRESS_WHITESPACE:
      return "Compress whitespace";
    case RuleTransformation.REMOVE_COMMENTS:
      return "Remove comments";
    case RuleTransformation.LENGTH:
      return "Length";
    default:
      return "";
  }
}

function TransformationComponent({ transforms, selectTransforms, padx }) {
  // const theme = useTheme();

  const aKeys = [
    // RuleTransformation.NONE,
    RuleTransformation.BASE64_DECODE,
    RuleTransformation.BASE64_ENCODE,
    RuleTransformation.HEX_DECODE,
    RuleTransformation.HEX_ENCODE,
    RuleTransformation.LOWERCASE,
    RuleTransformation.REMOVE_NULLS,
    RuleTransformation.REMOVE_WHITE_SPACE,
    RuleTransformation.REPLACE_NULLS,
    RuleTransformation.URL_DECODE,
    RuleTransformation.UPPERCASE,
    RuleTransformation.URL_DECODE_UNI,
    RuleTransformation.URL_ENCODE,
    RuleTransformation.UTF8_TO_UNICODE,
    RuleTransformation.TRIM_LEFT,
    RuleTransformation.TRIM_RIGHT,
    RuleTransformation.TRIM,
    RuleTransformation.DECODE_HTML_ENTITY_ESCAPE,
    RuleTransformation.DECODE_JS_ESCAPE,
    RuleTransformation.DECODE_CSS_ESCAPE,
    RuleTransformation.DECODE_CLI_ESCAPE,
    RuleTransformation.PATH_NORMALIZATION,
    RuleTransformation.COMPRESS_WHITESPACE,
    RuleTransformation.REMOVE_COMMENTS,
    RuleTransformation.LENGTH,
  ];

  return CustomSelectBox({
    keys: aKeys,
    getTitle: getTransformationTitle,
    values: transforms,
    selectValues: selectTransforms,
    padx,
  });

  // const [selectedItems, setSelectedItems] = React.useState(null);

  // const handleDelete = (e, value) => {
  //   e.preventDefault();
  //   setSelectedItems((current) => _without(current, value));
  // };
  // const handleChange = (event) => {
  //   const value = event.target.value;
  //   setSelectedItems(
  //     // On autofill we get a stringified value.
  //     typeof value === "string" ? value.split(",") : value
  //   );
  // };

  // React.useEffect(() => {
  //   if (null === selectedItems) {
  //     setSelectedItems(transforms);
  //   }
  // }, [transforms]); // eslint-disable-line react-hooks/exhaustive-deps

  // React.useEffect(() => {
  //   if (null !== selectedItems) {
  //     selectTransforms(selectedItems, padx);
  //   }
  // }, [selectedItems, padx]); // eslint-disable-line react-hooks/exhaustive-deps

  // return (
  //   <FormControl fullWidth>
  //     {/* <InputLabel id="demo-multiple-chip-label">
  //               Select transformation...
  //           </InputLabel> */}
  //     <Select
  //       labelId="demo-multiple-chip-label"
  //       id="demo-multiple-chip"
  //       multiple
  //       fullWidth
  //       value={transforms}
  //       onChange={handleChange}
  //       renderValue={(selected) => (
  //         <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
  //           {selected.map((value) => (
  //             <Chip
  //               key={value}
  //               label={getTransformationTitle(value)}
  //               clickable
  //               deleteIcon={<CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
  //               onDelete={(e) => handleDelete(e, value)}
  //               // onClick={() => console.log("clicked chip")}
  //             />
  //           ))}
  //         </Box>
  //       )}
  //       MenuProps={MenuProps}
  //     >
  //       {aKeys.map((keyValue, keyIdx) => (
  //         <MenuItem key={`_transform${keyIdx + 1}_${padx}`} value={keyValue} style={getMenuItemStyles(keyValue, transforms, theme)}>
  //           {getTransformationTitle(keyValue)}
  //         </MenuItem>
  //       ))}
  //     </Select>
  //   </FormControl>
  // );
}

function ActionComponent({ action, setAction }) {
  return (
    <Select value={action} onChange={(event) => setAction(event.target.value)} sx={{ width: "95%" }}>
      <MenuItem key={`action_${RuleAction.PASS}`} value={RuleAction.PASS}>
        Pass
      </MenuItem>
      <MenuItem key={`action_${RuleAction.BLOCK}`} value={RuleAction.BLOCK}>
        Block
      </MenuItem>
      <MenuItem key={`action_${RuleAction.LOG}`} value={RuleAction.LOG}>
        Log
      </MenuItem>
    </Select>
  );
}

function AndComponent() {
  return (
    <Grid item xs={12} my={4}>
      <Grid container spacing={4} display="flex" alignItems="center">
        <Grid item>
          <Typography variant="h5">And</Typography>
        </Grid>
        <Grid item xs>
          <Divider />
        </Grid>
      </Grid>
    </Grid>
  );
}

function getRuleActionString(action) {
  switch (action) {
    case RuleAction.PASS:
      return "Pass";
    case RuleAction.BLOCK:
      return "Block";
    case RuleAction.LOG:
      return "Log";
    default:
      return "Action";
  }
}

export {
  getRuleActionString,
  AndComponent,
  ActionComponent,
  OperatorComponent,
  TransformationComponent,
  ValueComponent,
  VariableComponent,
};
