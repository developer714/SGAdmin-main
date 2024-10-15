import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, Select, Chip, CircularProgress, useTheme } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "react-feather";

import SecRuleTable from "./T_SecRule";

import useAuth from "../../../../../hooks/useAuth";
import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import { Box, Button, IconButton, Input, MenuItem, Search, SearchIconWrapper, SnackbarAlert } from "../../common/styled";
import { removeA } from "./component";
import { ExceptionSkipRuleType } from "../../../../../utils/constants";
import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

function SecRuleSelectModal({ open, action, handleClose, setSkipedRules, skipedRuleID, setSkipedRuleID }) {
  const theme = useTheme();
  const {
    getRulesForException,
    rulesForException,
    getRules,
    getSdSigRules,
    getAllCrsSecRules,
    getAllSdSecRules,
    crsrules,
    sdSigRules,
    allCrsSecRules,
    allSdSecRules,
    setErr,
    errMsg,
  } = useWAFConfig();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [ruleID, setRuleID] = React.useState(ExceptionSkipRuleType.SIGNATURE === action ? "all" : "sdall");
  const [pattern, setPattern] = React.useState("");
  const [selected, setSelected] = React.useState([]);
  const [currule, setCurrule] = React.useState([]);
  const [_skipedRuleID, _setSkipedRuleID] = React.useState([]);

  React.useEffect(() => {
    _setSkipedRuleID(skipedRuleID);
  }, [skipedRuleID]);
  React.useEffect(() => {
    if (isAuthenticated) {
      if (open) {
        if (ExceptionSkipRuleType.SIGNATURE === action) {
          getRules();
          getRulesForException("all");
          setRuleID("all");
          getAllCrsSecRules();
        } else if (ExceptionSkipRuleType.SENSEDEFENCE_SIGNATURE === action) {
          getSdSigRules();
          getRulesForException("sdall");
          setRuleID("sdall");
          getAllSdSecRules();
        }
        _setSkipedRuleID(skipedRuleID);
        setSelected(skipedRuleID);
      }
    }
    setErr(null);
    return () => setErr(null);
  }, [isAuthenticated, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
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

  React.useEffect(() => {
    const tmpArr = rulesForException ? rulesForException.map((e) => e.sec_rule_id) : [];
    setCurrule(tmpArr);
  }, [rulesForException]);
  React.useEffect(() => {
    if (0 < currule.length && 0 < _skipedRuleID.length) {
      setSelected(_skipedRuleID.filter((value) => currule.includes(value)));
    }
  }, [currule]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    let tmpArr = _skipedRuleID.filter((value) => !currule.includes(value));
    _setSkipedRuleID(tmpArr.concat(selected));
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectRuleCategory = (event) => {
    setRuleID(event.target.value);
    getRulesForException(event.target.value);
  };
  const handleDelete = (id) => {
    let list = [..._skipedRuleID];
    _setSkipedRuleID(removeA(list, id));
    list = [...selected];
    setSelected(removeA(list, id));
  };
  const setRules = async () => {
    setLoading(true);
    const rules = ExceptionSkipRuleType.SIGNATURE === action ? allCrsSecRules : allSdSecRules;
    var tmpArr = rules?.filter((e) => _skipedRuleID.indexOf(e.sec_rule_id) > -1);
    setSkipedRules(tmpArr);
    setSkipedRuleID(_skipedRuleID);
    setLoading(false);
    handleClose();
  };
  return (
    <React.Fragment>
      <Modal
        open={open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
      >
        <Box sx={{ width: { lg: "1150px", xs: "90%" } }}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Grid container pt={2} px={4} borderBottom={"solid 1px #ccc"}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Select SecRules</Typography>
                </Grid>
                <Grid item xs></Grid>
                <Grid item display="flex" alignItems="center">
                  <IconButton onClick={handleClose} size="large">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container px={3} pt={5}>
            {loading ? (
              <Grid item xs={12}>
                <Root>
                  <CircularProgress color="primary" />
                </Root>
              </Grid>
            ) : (
              <></>
            )}
            <Grid item xs></Grid>
            <Grid item xs={12} md={4}>
              <Search style={{ border: "1px solid #C1C1C1" }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <Input
                  placeholder="Search Rule"
                  value={pattern}
                  onChange={(event) => {
                    setPattern(event.target.value);
                  }}
                />
              </Search>
            </Grid>
            <Grid item xs={12} md={4} ml={2}>
              {ExceptionSkipRuleType.SIGNATURE === action ? (
                <Select fullWidth value={ruleID} sx={{ border: "1px solid #C1C1C1" }} onChange={selectRuleCategory}>
                  <MenuItem value={"all"}>All Rules</MenuItem>
                  {crsrules?.map((rule) => {
                    return <MenuItem value={rule.rule_id}>{rule.description || rule.name}</MenuItem>;
                  })}
                </Select>
              ) : (
                <Select fullWidth value={ruleID} sx={{ border: "1px solid #C1C1C1" }} onChange={selectRuleCategory}>
                  <MenuItem value={"sdall"}>All Rules</MenuItem>
                  {sdSigRules?.map((rule) => {
                    return <MenuItem value={rule.rule_id}>{rule.description || rule.name}</MenuItem>;
                  })}
                </Select>
              )}
            </Grid>
            {_skipedRuleID.length > 0 ? (
              <Grid item xs={12} mt={6}>
                {_skipedRuleID.map((id) => {
                  return (
                    <Chip
                      label={id}
                      variant="contained"
                      onDelete={() => handleDelete(id)}
                      sx={{
                        marginBottom: "2px",
                        marginRight: "10px",
                        borderRadius: "8px",
                        background: theme.palette.custom.yellow.opacity_80,
                      }}
                    />
                  );
                })}
              </Grid>
            ) : (
              <></>
            )}
          </Grid>
          <Grid container>
            <Grid item xs={12} mt={6}>
              <SecRuleTable pattern={pattern} selected={selected} setSelected={setSelected} />
            </Grid>
          </Grid>
          <Grid container px={3} py={8}>
            <Grid item xs={12} textAlign={"right"}>
              <Button variant="contained" color="warning" size="modal" mr={4} startIcon={<CancelIcon />} onClick={handleClose}>
                Close
              </Button>
              <Button variant="contained" color="success" size="modal" startIcon={<ConfirmIcon />} onClick={setRules}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default SecRuleSelectModal;
