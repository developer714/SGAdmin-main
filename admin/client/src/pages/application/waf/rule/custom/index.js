import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import { Search as SearchIcon } from "react-feather";

import useAuth from "../../../../../hooks/useAuth";
import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import { FeatureId, UserRole } from "../../../../../utils/constants";

import { Button, Input, Search, SearchIconWrapper, SnackbarAlert } from "../../../../../components/pages/application/common/styled";
import CustomRuleTable from "../../../../../components/pages/application/waf/config/T_CustomRule";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDate } from "../../../../../utils/format";

function CustomRule() {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, isFeatureEnabled } = useAuth();
  const { getCustomRules, errMsg, setErr } = useWAFConfig();

  React.useEffect(() => {
    if (isAuthenticated) {
      getCustomRules();
    }
  }, [isAuthenticated, getCustomRules]);

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

  const gotoAddNewCustomRule = () => {
    navigate("/application/waf/rule/custom/new");
  };
  const refresh = () => {
    getCustomRules();
  };
  const downloadRules = () => {
    var curDate = new Date();
    const input = document.getElementsByClassName("MuiTableContainer-root")[0];
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
        unit: "px",
        format: [input.offsetWidth + 240, input.offsetHeight + 180],
      });
      pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
      pdf.save(`SG_CustomRules (` + formatDate(curDate) + `).pdf`);
    });
  };

  return (
    <React.Fragment>
      <Helmet title="Custom Rule" />
      <Grid container sx={{ display: "flex", alignItems: "center" }} mt={9}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Custom Rule Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Search style={{ background: "white", border: "none" }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <Input
              placeholder="Search Name, IP, Country etc"
              // value={pattern}
              onChange={(event) => {
                // setPattern(event.target.value);
              }}
            />
          </Search>
          <Button
            variant="contained"
            color="primary"
            ml={2}
            disabled={UserRole.READONLY_USER === userRole || !isFeatureEnabled(FeatureId.CUSTOM_WAF_RULES)}
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => gotoAddNewCustomRule()}
          >
            Add Custom Rule
          </Button>
        </Grid>
      </Grid>
      <CustomRuleTable refresh={refresh} downloadRules={downloadRules} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default CustomRule;
