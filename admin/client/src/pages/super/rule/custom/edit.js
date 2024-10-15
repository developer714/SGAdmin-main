import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Typography, TextField, CircularProgress, Tooltip } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BackIcon from "@mui/icons-material/ArrowBackOutlined";
import { RuleAction, ExpressionKeyField, RuleTransformation, RuleOperator } from "../../../../utils/constants";

import useRule from "../../../../hooks/super/useRule";
import useAuth from "../../../../hooks/useAuth";

import {
  Button,
  CollapseAlert,
  Divider,
  IconButton,
  LoadingButton,
  Root,
  SnackbarAlert,
} from "../../../../components/pages/application/common/styled";
import {
  ActionComponent,
  AndComponent,
  OperatorComponent,
  TransformationComponent,
  VariableComponent,
  ValueComponent,
} from "../../../../components/pages/application/waf/rule/custom/component";

function SAEditCustomRule() {
  const navigate = useNavigate();
  const { customRuleId } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const { getCustomRule, updateCustomRule, setErr, errMsg } = useRule();
  const [ruleName, setRuleName] = React.useState();
  const [conditions, setConditions] = React.useState([
    {
      key: [],
      transform: [],
      operator: RuleOperator.NONE,
      value: "",
    },
  ]);

  const [action, setAction] = React.useState(RuleAction.PASS);
  const [initFlag, setInitFlag] = React.useState(false);
  const readOnly = false;

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      setInitFlag(true);
      setErr(null);
      const res = await getCustomRule(customRuleId);
      setRuleName(res?.description || undefined);
      const _conditions = res?.conditions;
      _conditions.forEach((_condition) => {
        if (!_condition.transform || !_condition.transform.length) {
          _condition.transform = [RuleTransformation.NONE];
        }
        if (_condition.negative) {
          _condition.operator = "!" + _condition.operator;
        }
      });
      setConditions(
        _conditions || [
          {
            key: ["none"],
            transform: [RuleTransformation.NONE],
            operator: RuleOperator.NONE,
            value: "",
          },
        ]
      );
      setAction(res?.action || RuleAction.PASS);
      setInitFlag(false);
    };
    if (isAuthenticated) init();
    return () => setErr(null);
  }, [isAuthenticated, setErr, getCustomRule, customRuleId]);

  const ruleNameChange = (event) => {
    if (readOnly) return;
    setRuleName(event.target.value);
  };

  const selectVariables = useCallback(
    (keys, i) => {
      if (readOnly) return;
      let list = [...conditions];
      if (i < list.length) {
        list[i]["key"] = keys;
      }
      setConditions(list);
    },
    [readOnly, conditions]
  );
  const selectTransforms = useCallback(
    (transforms, i) => {
      if (readOnly) return;
      let list = [...conditions];
      if (i < list.length) {
        list[i]["transform"] = transforms;
      }
      setConditions(list);
    },
    [readOnly, conditions]
  );
  const selectOperatorStr = (event, i) => {
    if (readOnly) return;
    let list = [...conditions];
    if (i < list.length) {
      list[i]["operator"] = event.target.value;
    }
    setConditions(list);
  };
  const selectValueStr = (value, i) => {
    if (readOnly) return;
    let list = [...conditions];
    if (i < list.length) {
      list[i]["value"] = value;
    }
    setConditions(list);
  };
  const duplicateClick = (i) => {
    if (readOnly) return;
    let list = [...conditions];
    if (i < list.length) {
      list.push(JSON.parse(JSON.stringify(list[i])));
    }
    setConditions(list);
  };

  const addClick = (e) => {
    if (readOnly) return;
    let list = [...conditions];
    list.push({
      key: [],
      transform: [],
      operator: RuleOperator.NONE,
      value: "",
    });
    setConditions(list);
  };

  const removeClick = (i) => {
    if (readOnly) return;
    let list = [...conditions];
    if (i < list.length) {
      list.splice(i, 1);
    }
    if (0 === list.length) {
      list.push({
        key: [],
        transform: [],
        operator: RuleOperator.NONE,
        value: "",
      });
    }
    setConditions(list);
  };

  const onBackPressed = (event) => {
    // navigate("/application/" + configSite + "/firewall");
    navigate(-1);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (readOnly) return;
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
    const result = await updateCustomRule(customRuleId, {
      description: ruleName,
      conditions: _conditions,
      action: action,
    });
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
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title={readOnly ? "View Custom Rule" : "Edit Custom Rule"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            {readOnly ? "View Custom Rule" : "Edit Custom Rule"}
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          {readOnly ? (
            <></>
          ) : (
            <LoadingButton
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              loadingPosition="start"
              loading={loading}
              onClick={handleSave}
            >
              Save
            </LoadingButton>
          )}
          <Button
            variant="outlined"
            color="primary"
            ml={4}
            onClick={onBackPressed}
            sx={{
              fontSize: "15px",
            }}
          >
            <BackIcon
              sx={{
                marginRight: "8px",
                width: "20px",
                height: "20px",
              }}
            />
            Back
          </Button>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      {initFlag ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h2" pb={2}>
                Rule Name
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField value={ruleName} onChange={ruleNameChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" pt={8} pb={4}>
                When incoming requests match...
              </Typography>
            </Grid>
          </Grid>
          {conditions.map((andCond, i) => {
            return (
              <>
                <Grid
                  container
                  sx={{
                    background: "#F8F8F8",
                    padding: "16px",
                    borderLeft: "solid 4px #888",
                  }}
                >
                  <Grid item xs={12}>
                    <Grid container display="flex" alignItems="center">
                      <Grid item xs={3}>
                        <Typography variant="h2" gutterBottom>
                          Field
                        </Typography>
                      </Grid>
                      <Grid item xs />
                      <Grid item xs={1} display="flex" justifyContent={"flex-end"}>
                        <Tooltip title="Duplicate condition">
                          <IconButton mx={2} size="large" onClick={() => duplicateClick(i)}>
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove condition">
                          <IconButton size="large" onClick={() => removeClick(i)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <VariableComponent variables={andCond.key} selectVariables={selectVariables} padx={i} />
                  </Grid>
                  <Grid item xs={12} pt={4}>
                    <Typography variant="h2" gutterBottom>
                      Transformation
                    </Typography>
                    <TransformationComponent
                      transforms={andCond.transform}
                      selectTransforms={selectTransforms}
                      disabled={andCond.key?.length === 0}
                      padx={i}
                    />
                  </Grid>
                  <Grid item xs={12} pt={4}>
                    <Typography variant="h2" gutterBottom>
                      Operator
                    </Typography>
                    <OperatorComponent
                      operatorStr={andCond.operator}
                      selectOperatorStr={(event) => selectOperatorStr(event, i)}
                      disabled={andCond.key?.length === 0}
                      padx={i}
                    />
                  </Grid>
                  {andCond.operator === RuleOperator.DETECT_SQLI || andCond.operator === RuleOperator.DETECT_XSS ? (
                    <></>
                  ) : (
                    <Grid item xs={12} pt={4}>
                      <Typography variant="h2" gutterBottom>
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
                {conditions.length - 1 > i && <AndComponent />}
              </>
            );
          })}
          <Button
            variant="outlined"
            color="primary"
            m={4}
            onClick={addClick}
            sx={{
              fontSize: "15px",
            }}
          >
            <AddCircleOutlineIcon />
            <Typography pl={2}> Add Condition</Typography>
          </Button>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h2" pt={8} pb={2}>
                Then
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <ActionComponent userRole={userRole} action={action} setAction={setAction} />
            </Grid>
          </Grid>
        </>
      )}

      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAEditCustomRule;
