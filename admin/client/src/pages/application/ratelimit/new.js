import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Select, Typography, TextField, Stack } from "@mui/material";

import {
  UserRole,
  FirewallAction,
  RateLimitMitigationTimeout,
  RateLimitPeriod,
  RateLimitCharacteristicKey,
  FeatureId,
  ExpressionKeyField,
} from "../../../utils/constants";

import useRateLimit from "../../../hooks/user/useRateLimit";
import useSite from "../../../hooks/user/useSite";
import useAuth from "../../../hooks/useAuth";

import {
  CondComponent,
  CountryValueComponent,
  getValidCondFlag,
  KeyComponent,
  MethodValueComponent,
  ValueComponent,
} from "../../../components/pages/application/rule/component";
import { Button, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";
import {
  ActionComponent,
  CharacteristicsKeyComponent,
  CharacteristicsValueComponent,
} from "../../../components/pages/application/ratelimit/component";

import { ReactComponent as DeleteIcon } from "../../../vendor/button/delete.svg";
import { ReactComponent as BackIcon } from "../../../vendor/button/back.svg";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";
import { ReactComponent as AddIcon } from "../../../vendor/button/add.svg";
import { ReactComponent as DuplicateIcon } from "../../../vendor/button/duplicate.svg";

function NewRateLimit() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { isAuthenticated, userRole, isFeatureEnabled } = useAuth();
  const { siteList, getSitesForItems } = useSite();
  const { addNewRateLimit, setErr, errMsg } = useRateLimit();
  // const [disableMenu, setDisableMenu] = React.useState(
  //     getValidCondFlag("src_ip")
  // );
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSitesForItems();
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getSitesForItems]);
  const siteUid = configSite;

  const selectCurrentSite = (event) => {
    navigate(`/application/${event.target.value}/ratelimit/new`);
  };
  const [ratelimitName, setRateLimitName] = React.useState();
  const ratelimitNameChange = (event) => {
    if (UserRole.READONLY_USER === userRole) return;
    setRateLimitName(event.target.value);
  };
  const [conditions, setConditions] = React.useState([[{ key: "none", condition: "none", value: "" }]]);
  const [characteristics, setCharacteristics] = React.useState([{ key: "none", value: "" }]);
  const selectKeyStr = (event, i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i][j]["key"] = event.target.value;
    // setDisableMenu(getValidCondFlag(event.target.value));
    setConditions(list);
  };
  const selectCondStr = (event, i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i][j]["condition"] = event.target.value;
    setConditions(list);
  };
  const selectValueStr = (event, i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i][j]["value"] = event.target.value;
    setConditions(list);
  };
  const selectCountryStr = (event, newValue, i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i][j]["value"] = newValue?.value;
    setConditions(list);
  };
  const andConditionClick = (i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i].splice(j + 1, 0, { key: "none", condition: "none", value: "" });
    setConditions(list);
  };
  const orConditionClick = () => {
    if (UserRole.READONLY_USER === userRole) return;
    setConditions([...conditions, [{ key: "none", condition: "none", value: "" }]]);
  };
  const removeConditionClick = (i, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...conditions];
    list[i].splice(j, 1);
    if (list[i].length === 0) list.splice(i, 1);
    if (0 === list.length) {
      list.push([{ key: "none", condition: "none", value: "" }]);
    }
    setConditions(list);
  };

  const selectCharacteristicKeyStr = (event, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...characteristics];
    list[j]["key"] = event.target.value;
    // setDisableMenu(getValidCondFlag(event.target.value));
    setCharacteristics(list);
  };
  const selectCharacteristicValueStr = (event, j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...characteristics];
    list[j]["value"] = event.target.value;
    setCharacteristics(list);
  };

  const andCharacteristicClick = () => {
    if (UserRole.READONLY_USER === userRole) return;
    setCharacteristics([...characteristics, { key: "none", value: "" }]);
  };
  const removeCharacteristicClick = (j) => {
    if (UserRole.READONLY_USER === userRole) return;
    let list = [...characteristics];
    list.splice(j, 1);
    if (0 === list.length) {
      list.push({ key: "none", value: "" });
    }
    setCharacteristics(list);
  };

  const return2List = () => {
    navigate(`/application/${siteUid}/ratelimit`);
  };
  const onBackPressed = (event) => {
    navigate(-1);
  };
  const [action, setAction] = React.useState(FirewallAction.BLOCK);
  const [mitigationTimeout, setMitigationTimeout] = React.useState(RateLimitMitigationTimeout.THIRTY_SECONDS);
  const [requestsPerPeriod, setRequestsPerPeriod] = React.useState(1);
  const [period, setPeriod] = React.useState(RateLimitPeriod.TEN_SECONDS);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const selectRequstsPerPeriod = (event) => {
    if (UserRole.READONLY_USER === userRole) return;
    setRequestsPerPeriod(event.target.value);
  };

  const selectPeriod = (event) => {
    if (UserRole.READONLY_USER === userRole) return;
    setPeriod(event.target.value);
  };

  const handleSave = async () => {
    if (UserRole.READONLY_USER === userRole) return;
    let conditionCheck = true;
    let conditionEmpty = false;
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
    if (false === conditionCheck && 1 === conditions.length && 1 === conditions[0].length) {
      conditionCheck = true;
      conditionEmpty = true;
    }
    if (conditionCheck) {
      characteristics.forEach((characteristic) => {
        if (characteristic.key === "none" || characteristic.key === undefined || characteristic.key === null) {
          conditionCheck = false;
          return;
        }
        if (
          characteristic.key === RateLimitCharacteristicKey.HEADERS ||
          characteristic.key === RateLimitCharacteristicKey.COOKIE ||
          characteristic.key === RateLimitCharacteristicKey.QUERY
        ) {
          if (characteristic.value === "" || characteristic.value === undefined || characteristic.value === null) {
            conditionCheck = false;
            return;
          }
        }
      });
    }
    if (conditionCheck === false) {
      setErr("You must select or input the field, operator, and value for request matching.");
      return;
    }
    setLoading(true);
    const result = await addNewRateLimit(siteUid, {
      name: ratelimitName,
      conditions: conditionEmpty ? [[]] : conditions,
      action: action,
      mitigation_timeout: mitigationTimeout,
      requests_per_period: requestsPerPeriod,
      period: period,
      characteristics: characteristics,
    });
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
      <Helmet title="New Rate Limiting Rule" />
      <Grid container sx={{ display: "flex", alignItems: "center" }} pt={9} pb={6}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Add Rate Limiting Rule
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={siteUid} onChange={selectCurrentSite} sx={{ width: "320px", marginRight: "16px", border: "none" }}>
            {siteList?.map((site, i) => {
              return (
                <MenuItem key={i} value={site.id}>
                  {site.site_id}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2" pb={2}>
            Rule Name
          </Typography>
          <Typography pb={2}>Give your rule a description name</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField sx={{ background: "white" }} value={ratelimitName} onChange={ratelimitNameChange} fullWidth />
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
                              <Button variant="text" size="small" startIcon={<AddIcon />} onClick={orConditionClick}>
                                Add New
                              </Button>
                            )}
                            <Button variant="text" size="small" startIcon={<DuplicateIcon />} onClick={() => andConditionClick(i, j)}>
                              And
                            </Button>
                            <Button variant="text" size="small" startIcon={<DeleteIcon />} onClick={() => removeConditionClick(i, j)}>
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
        <Grid item xs={12} md={3}>
          <Typography variant="h2" pt={6} pb={2}>
            Then...
          </Typography>
          <Typography variant="h3" pb={2}>
            Choose action
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h2" pt={6} pb={2}>
            For...
          </Typography>
          <Typography variant="h3" pb={2}>
            Duration
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} />
        <Grid item xs={12} md={3}>
          <ActionComponent action={action} setAction={setAction} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Select value={mitigationTimeout} onChange={(event) => setMitigationTimeout(event.target.value)} sx={{ width: "95%" }}>
            <MenuItem key={"mitigation_timeout_30"} value={RateLimitMitigationTimeout.THIRTY_SECONDS}>
              30 Seconds
            </MenuItem>
            <MenuItem key={"mitigation_timeout_60"} value={RateLimitMitigationTimeout.ONE_MINUTE}>
              1 Minute
            </MenuItem>
            <MenuItem key={"mitigation_timeout_600"} value={RateLimitMitigationTimeout.TEN_MINUTES}>
              10 Minutes
            </MenuItem>
            <MenuItem key={"mitigation_timeout_3600"} value={RateLimitMitigationTimeout.ONE_HOUR}>
              1 Hour
            </MenuItem>
            <MenuItem key={"mitigation_timeout_86400"} value={RateLimitMitigationTimeout.ONE_DAY}>
              1 Day
            </MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={6} />
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2" pt={6} pb={2}>
            When rate exceeds...
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container display="flex" alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h3" pb={2}>
                Requests
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h3" pb={2}>
                Period
              </Typography>
            </Grid>
            <Grid item xs></Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container display="flex" alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                value={requestsPerPeriod}
                onChange={selectRequstsPerPeriod}
                sx={{ background: "white", width: "95%", marginBottom: "8px" }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Select value={period} onChange={selectPeriod} sx={{ width: "95%", marginBottom: "8px" }}>
                <MenuItem key={"period_10"} value={RateLimitPeriod.TEN_SECONDS}>
                  10 Seconds
                </MenuItem>
                <MenuItem key={"period_60"} value={RateLimitPeriod.ONE_MINUTE}>
                  1 Minute
                </MenuItem>
                <MenuItem key={"period_120"} value={RateLimitPeriod.TWO_MINUTES}>
                  2 Minutes
                </MenuItem>
                <MenuItem key={"period_300"} value={RateLimitPeriod.FIVE_MINUTES}>
                  5 Minutes
                </MenuItem>
                <MenuItem key={"period_600"} value={RateLimitPeriod.TEN_MINUTES}>
                  10 Minutes
                </MenuItem>
                {isFeatureEnabled(FeatureId.ADVANCED_FEATURES_IN_RATE_LIMIT_RULE) && (
                  <MenuItem key={"period_3600"} value={RateLimitPeriod.ONE_HOUR}>
                    1 Hour
                  </MenuItem>
                )}
              </Select>
            </Grid>
            <Grid item xs></Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h2" pt={4} pb={2}>
            With the same...
          </Typography>
        </Grid>
        {characteristics.map((characteristic, j) => {
          return (
            <>
              {j > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h2" pt={6} pb={2}>
                    And
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} md={3}>
                <CharacteristicsKeyComponent
                  keyStr={characteristic.key}
                  selectKeyStr={(event) => selectCharacteristicKeyStr(event, j)}
                  pady={j}
                  advanced={isFeatureEnabled(FeatureId.ADVANCED_FEATURES_IN_RATE_LIMIT_RULE)}
                />
              </Grid>
              <Grid item xs={12} md={7} display="flex" alignItems="center">
                {(characteristic.key === RateLimitCharacteristicKey.QUERY ||
                  characteristic.key === RateLimitCharacteristicKey.HEADERS ||
                  characteristic.key === RateLimitCharacteristicKey.COOKIE) && (
                  <CharacteristicsValueComponent
                    valueStr={characteristic.value}
                    selectValueStr={(event) => selectCharacteristicValueStr(event, j)}
                    disabled={characteristic.key === "none"}
                    pady={j}
                  />
                )}
                {characteristics.length - 1 === j && (
                  <Button variant="text" size="small" ml={4} startIcon={<DuplicateIcon />} onClick={andCharacteristicClick}>
                    And
                  </Button>
                )}
                <Button variant="text" size="small" ml={4} startIcon={<DeleteIcon />} onClick={() => removeCharacteristicClick(j)}>
                  Delete
                </Button>
              </Grid>
            </>
          );
        })}
      </Grid>
      {UserRole.READONLY_USER === userRole ? (
        <></>
      ) : (
        <Stack direction="row" justifyContent="end" spacing={2} mt={9}>
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
      )}
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default NewRateLimit;
