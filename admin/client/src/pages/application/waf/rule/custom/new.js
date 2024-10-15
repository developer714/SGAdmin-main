import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, TextField, Stack } from "@mui/material";

import { UserRole, FirewallAction, ExpressionKeyField, RuleTransformation, RuleOperator } from "../../../../../utils/constants";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import useAuth from "../../../../../hooks/useAuth";

import {
  ActionComponent,
  OperatorComponent,
  TransformationComponent,
  ValueComponent,
  VariableComponent,
} from "../../../../../components/pages/application/waf/rule/custom/component";
import { Button, SnackbarAlert } from "../../../../../components/pages/application/common/styled";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";
import { ReactComponent as AddIcon } from "../../../../../vendor/button/add.svg";
import { ReactComponent as DuplicateIcon } from "../../../../../vendor/button/duplicate.svg";
import { ReactComponent as DeleteIcon } from "../../../../../vendor/button/delete.svg";
import { ReactComponent as BackIcon } from "../../../../../vendor/button/back.svg";

function NewCustomRule() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { createCustomRule, setErr, errMsg } = useWAFConfig();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    return () => setErr(null);
  }, [setErr]);

  const [ruleName, setRuleName] = React.useState();
  const ruleNameChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setRuleName(event.target.value);
  };

  const [conditions, setConditions] = React.useState([{ key: [], transform: [], operator: RuleOperator.NONE, value: "" }]);
  const selectVariables = useCallback(
    (keys, i) => {
      if (userRole === UserRole.READONLY_USER) return;
      let list = [...conditions];
      if (i < list.length) {
        list[i]["key"] = keys;
      }
      setConditions(list);
    },
    [userRole, conditions]
  );
  const selectTransforms = useCallback(
    (transforms, i) => {
      if (userRole === UserRole.READONLY_USER) return;
      let list = [...conditions];
      if (i < list.length) {
        list[i]["transform"] = transforms;
      }
      setConditions(list);
    },
    [userRole, conditions]
  );
  const selectOperatorStr = (event, i) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    if (i < list.length) {
      list[i]["operator"] = event.target.value;
    }
    setConditions(list);
  };
  const selectValueStr = (value, i) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    if (i < list.length) {
      list[i]["value"] = value;
    }
    setConditions(list);
  };
  const duplicateClick = (i) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    if (i < list.length) {
      list.push(JSON.parse(JSON.stringify(list[i])));
    }
    setConditions(list);
  };

  const addClick = (e) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list.push({ key: [], transform: [], operator: RuleOperator.NONE, value: "" });
    setConditions(list);
  };

  const removeClick = (i) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    if (i < list.length) {
      list.splice(i, 1);
    }
    if (0 === list.length) {
      list.push({ key: [], transform: [], operator: RuleOperator.NONE, value: "" });
    }
    setConditions(list);
  };
  const onBackPressed = (event) => {
    navigate(-1);
  };

  const [action, setAction] = React.useState(FirewallAction.LOG);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    let conditionCheck = true;
    const _conditions = JSON.parse(JSON.stringify(conditions)); // Deep copy of conditions
    _conditions.forEach((andCond) => {
      if (
        andCond.key === undefined ||
        andCond.key === null ||
        andCond.key[0] === "none" ||
        andCond.transform === undefined ||
        andCond.transform === null ||
        andCond.operator === "none" ||
        andCond.operator === undefined ||
        andCond.operator === null
      ) {
        conditionCheck = false;
      }

      if (!andCond.value && !(andCond.operator === RuleOperator.DETECT_SQLI || andCond.operator === RuleOperator.DETECT_XSS)) {
        conditionCheck = false;
      }

      if (-1 < andCond.operator.indexOf("!")) {
        andCond.operator = andCond.operator.substring(1);
        andCond.negative = true;
      } else {
        andCond.negative = false;
      }
      if (1 === andCond.transform.length && RuleTransformation.NONE === andCond.transform[0]) {
        andCond.transform = [];
      }
      if (RuleOperator.DETECT_SQLI === andCond.operator || RuleOperator.DETECT_XSS === andCond.operator) {
        andCond.value = "";
      }
    });
    if (conditionCheck === false) {
      setErr("You must select or input the field, operator, and value for request matching.");
      return;
    }
    setLoading(true);
    const result = await createCustomRule({ description: ruleName, conditions: _conditions, action: action });
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
    if ("success" === result.status) {
      setTimeout(() => {
        onBackPressed(null);
      }, 1000);
    }
  };

  React.useEffect(() => {
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="New Custom Rule" />
      <Grid container mt={11.5}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Create New Custom Rule
          </Typography>
        </Grid>
      </Grid>
      <Grid container mt={14} rowSpacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">Rule Name</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField value={ruleName} onChange={ruleNameChange} fullWidth />
        </Grid>
      </Grid>
      <Stack direction="column" spacing={6} mt={6}>
        {conditions.map((andCond, i) => {
          return (
            <Grid container sx={{ background: "white", padding: "18px 16px 28px 10px", borderRadius: 2 }}>
              <Grid item xs={12}>
                <Typography variant="h2">{i === 0 ? "When incoming requests match..." : "And"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Stack direction="column" spacing={2} mt={6}>
                  <Typography variant="h2">Field</Typography>
                  <VariableComponent variables={andCond.key} selectVariables={selectVariables} padx={i} />
                </Stack>
                <Stack direction="column" spacing={2} mt={6}>
                  <Typography variant="h2">Transformation</Typography>
                  <TransformationComponent
                    transforms={andCond.transform}
                    selectTransforms={selectTransforms}
                    disabled={andCond.key?.length === 0}
                    padx={i}
                  />
                </Stack>
                <Stack direction="column" spacing={2} mt={6}>
                  <Typography variant="h2">Operator</Typography>
                  <OperatorComponent
                    operatorStr={andCond.operator}
                    selectOperatorStr={(event) => selectOperatorStr(event, i)}
                    disabled={andCond.key?.length === 0}
                    padx={i}
                  />
                </Stack>
                {andCond.operator === RuleOperator.DETECT_SQLI || andCond.operator === RuleOperator.DETECT_XSS ? (
                  <></>
                ) : (
                  <Grid item xs={12} pt={4}>
                    <Typography variant="h2" mb={2}>
                      Value
                    </Typography>
                    <ValueComponent
                      valueStr={andCond.value}
                      selectValueStr={(event) => selectValueStr(event, i)}
                      disabled={andCond.key === ExpressionKeyField.NONE || andCond.operator === "none"}
                      padx={i}
                    />
                  </Grid>
                )}
              </Grid>
              <Stack width={"100%"} direction="row" justifyContent="end" alignItems="center" mt={9}>
                <Button variant="text" color="primary" size="small" startIcon={<AddIcon />} onClick={addClick}>
                  Add New Condition
                </Button>
                <Button variant="text" color="primary" size="small" startIcon={<DuplicateIcon />} onClick={() => duplicateClick(i)}>
                  Duplicate Condition
                </Button>
                <Button variant="text" color="primary" size="small" startIcon={<DeleteIcon />} onClick={() => removeClick(i)}>
                  Delete
                </Button>
              </Stack>
            </Grid>
          );
        })}
      </Stack>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2" pt={8} pb={2}>
            Then
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <ActionComponent action={action} setAction={setAction} />
        </Grid>
      </Grid>
      <Stack direction="row" justifyContent="end" spacing={4}>
        <Button variant="contained" color="warning" size="ui" ml={4} startIcon={<BackIcon />} onClick={onBackPressed}>
          Back
        </Button>
        <Button
          variant="contained"
          color="success"
          size="ui"
          startIcon={<ConfirmIcon />}
          loadingPosition="start"
          loading={loading}
          onClick={handleSave}
        >
          Save
        </Button>
      </Stack>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default NewCustomRule;
