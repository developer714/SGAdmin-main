import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Typography, TextField, CircularProgress, Stack } from "@mui/material";

import { UserRole, FirewallAction, ExpressionKeyField } from "../../../utils/constants";

import useFirewall from "../../../hooks/user/useFirewall";
import useAuth from "../../../hooks/useAuth";

import {
  ActionComponent,
  CondComponent,
  CountryValueComponent,
  getValidCondFlag,
  KeyComponent,
  MethodValueComponent,
  ValueComponent,
} from "../../../components/pages/application/rule/component";
import { Button, Root, SnackbarAlert } from "../../../components/pages/application/common/styled";

import { ReactComponent as DeleteIcon } from "../../../vendor/button/delete.svg";
import { ReactComponent as BackIcon } from "../../../vendor/button/back.svg";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";
import { ReactComponent as AddIcon } from "../../../vendor/button/add.svg";
import { ReactComponent as DuplicateIcon } from "../../../vendor/button/duplicate.svg";

function EditFirewall() {
  const navigate = useNavigate();
  const { configSite, firewallID } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const { getCurrentFirewall, updateFirewall, setErr, errMsg } = useFirewall();
  const siteUid = configSite;
  // const [disableMenu, setDisableMenu] = React.useState(
  //     getValidCondFlag("src_ip")
  // );
  const [firewallName, setFirewallName] = React.useState();
  const [conditions, setConditions] = React.useState([[{ key: "none", condition: "none", value: "" }]]);

  const [action, setAction] = React.useState(FirewallAction.LOG);
  const [initFlag, setInitFlag] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      setInitFlag(true);
      setErr(null);
      const res = await getCurrentFirewall(siteUid, firewallID);
      setFirewallName(res?.name ? res?.name : undefined);
      setConditions(res?.conditions ? res?.conditions : [[{ key: "none", condition: "none", value: "" }]]);
      setAction(res?.action ? res?.action : FirewallAction.LOG);
      setInitFlag(false);
    };
    if (isAuthenticated) init();
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  const firewallNameChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setFirewallName(event.target.value);
  };

  const selectKeyStr = (event, i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i][j]["key"] = event.target.value;
    // setDisableMenu(getValidCondFlag(event.target.value));
    setConditions(list);
  };
  const selectCondStr = (event, i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i][j]["condition"] = event.target.value;
    setConditions(list);
  };
  const selectValueStr = (event, i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i][j]["value"] = event.target.value;
    setConditions(list);
  };
  const selectCountryStr = (event, newValue, i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i][j]["value"] = newValue?.value;
    setConditions(list);
  };

  const andClick = (i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i].splice(j + 1, 0, { key: "none", condition: "none", value: "" });
    setConditions(list);
  };
  const orClick = () => {
    if (userRole === UserRole.READONLY_USER) return;
    setConditions([...conditions, [{ key: "none", condition: "none", value: "" }]]);
  };
  const removeClick = (i, j) => {
    if (userRole === UserRole.READONLY_USER) return;
    let list = [...conditions];
    list[i].splice(j, 1);
    if (list[i].length === 0) list.splice(i, 1);
    if (0 === list.length) {
      list.push([{ key: "none", condition: "none", value: "" }]);
    }
    setConditions(list);
  };

  const return2List = () => {
    navigate(`/application/${siteUid}/firewall`);
  };
  const onBackPressed = (event) => {
    navigate(-1);
  };

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
    conditions.forEach((orCond) => {
      orCond.forEach((andCond) => {
        if (
          andCond.key === "none" ||
          andCond.key === undefined ||
          andCond.key === null ||
          andCond.condition === "none" ||
          andCond.condition === undefined ||
          andCond.condition === null ||
          andCond.value === "" ||
          andCond.value === undefined ||
          andCond.value === null
        )
          conditionCheck = false;
      });
    });
    if (conditionCheck === false) {
      setErr("You must select or input the field, operator, and value for request matching.");
      return;
    }
    setLoading(true);
    const result = await updateFirewall(siteUid, firewallID, { action, name: firewallName, conditions: conditions });
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
    if ("success" === result.status) {
      setTimeout(() => {
        return2List();
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
      <Helmet title={UserRole.READONLY_USER === userRole ? "View WAF Firewall" : "Edit WAF Firewall"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }} pt={9} pb={6}>
        <Grid item>
          <Typography variant="h1" display="inline">
            {UserRole.READONLY_USER === userRole ? "View WAF Firewall" : "Edit WAF Firewall"}
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      {initFlag ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h2" pb={2}>
                Firewall Name
              </Typography>
              <Typography pb={2}>Give your Firewall a description name</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField sx={{ background: "white" }} value={firewallName} onChange={firewallNameChange} fullWidth />
            </Grid>
          </Grid>
          {conditions.map((orCond, i) => {
            return (
              <>
                <Grid container mt={6} sx={{ background: "white", borderRadius: "8px", padding: "18px 16px 30px 10px" }}>
                  {orCond.map((andCond, j) => {
                    return (
                      <>
                        <Grid item xs={12} mt={j === 0 ? 0 : 9}>
                          <Typography variant="h2">{j === 0 ? (i === 0 ? "When incoming requests match..." : "Or") : "And"}</Typography>
                        </Grid>
                        <Grid item xs={12} mt={5} pl={"5px"}>
                          <Grid container display="flex" alignItems="center">
                            <Grid item xs={12} md={3}>
                              <Typography variant="h3">Field</Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="h3">Operator</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h3">Value</Typography>
                            </Grid>
                            <Grid item xs={12} md={3} mt={2.5}>
                              <KeyComponent keyStr={andCond.key} selectKeyStr={(event) => selectKeyStr(event, i, j)} padx={i} pady={j} />
                            </Grid>
                            <Grid item xs={12} md={3} mt={2.5}>
                              <CondComponent
                                condStr={andCond.condition}
                                selectCondStr={(event) => selectCondStr(event, i, j)}
                                disableMenu={getValidCondFlag(andCond.key)}
                                disabled={andCond.key === "none"}
                                padx={i}
                                pady={j}
                              />
                            </Grid>
                            <Grid item xs={12} md={6} mt={2.5} display="flex" alignItems="center">
                              {andCond.key === ExpressionKeyField.METHOD ? (
                                <MethodValueComponent
                                  valueStr={andCond.value}
                                  selectValueStr={(event) => selectValueStr(event, i, j)}
                                  disabled={andCond.key === ExpressionKeyField.NONE || andCond.condition === "none"}
                                  padx={i}
                                  pady={j}
                                />
                              ) : andCond.key === ExpressionKeyField.COUNTRY ? (
                                <CountryValueComponent
                                  valueStr={andCond.value}
                                  selectValueStr={(event, newValue) => selectCountryStr(event, newValue, i, j)}
                                  disabled={andCond.key === "none" || andCond.condition === "none"}
                                />
                              ) : (
                                <ValueComponent
                                  keyStr={andCond.key}
                                  valueStr={andCond.value}
                                  selectValueStr={(event) => selectValueStr(event, i, j)}
                                  disabled={andCond.key === ExpressionKeyField.NONE || andCond.condition === "none"}
                                  padx={i}
                                  pady={j}
                                />
                              )}
                            </Grid>
                            <Grid item xs={12} mt={2}>
                              <Stack width={"100%"} direction="row" justifyContent="end" spacing={4}>
                                {conditions.length - 1 === i && orCond.length - 1 === j && (
                                  <Button variant="text" size="small" startIcon={<AddIcon />} onClick={orClick}>
                                    Add New
                                  </Button>
                                )}
                                <Button variant="text" size="small" startIcon={<DuplicateIcon />} onClick={() => andClick(i, j)}>
                                  And
                                </Button>
                                <Button variant="text" size="small" startIcon={<DeleteIcon />} onClick={() => removeClick(i, j)}>
                                  Delete
                                </Button>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    );
                  })}
                </Grid>
              </>
            );
          })}
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h2" pt={8} pb={2}>
                Firewall Engine Selection
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <ActionComponent userRole={userRole} action={action} setAction={setAction} />
            </Grid>
          </Grid>
        </>
      )}

      {UserRole.READONLY_USER === userRole ? (
        <></>
      ) : (
        <Stack direction="row" justifyContent="end" spacing={2} mt={9}>
          <Button variant="contained" color="warning" size="ui" startIcon={<BackIcon />} onClick={onBackPressed}>
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
      )}

      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default EditFirewall;
