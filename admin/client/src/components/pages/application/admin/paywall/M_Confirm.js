import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery, CircularProgress } from "@mui/material";

import usePaywall from "../../../../../hooks/user/usePaywall";
import useAuth from "../../../../../hooks/useAuth";
import { LicenseLevel } from "../../../../../utils/constants";

import { Button, SnackbarAlert } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;
function ConfirmModal({ open, handleClose, newPlan, action }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { cancelSubscription, reactivateSubscription, updateSubscription } = usePaywall();
  const { getUser } = useAuth();
  const [message, setMessage] = React.useState(null);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [success, setSuccess] = React.useState("error");
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const [loading, setLoading] = React.useState(false);
  const [operationFinished, setOperationFinished] = React.useState(false);

  const confirm = async () => {
    setLoading(true);
    let result;
    switch (action) {
      case "delete":
        result = await cancelSubscription(newPlan);
        setOperationFinished(true);
        setSuccess(result.status);
        setMessage(result.message);
        setSnackOpen(true);
        break;
      case "patch":
        result = await reactivateSubscription(newPlan);
        setOperationFinished(true);
        setSuccess(result.status);
        setMessage(result.message);
        setSnackOpen(true);
        break;
      default:
        if (newPlan === LicenseLevel.COMMUNITY || newPlan === LicenseLevel.ENTERPRISE) {
          result = await updateSubscription(newPlan, null);
          setOperationFinished(true);
          setSuccess(result.status);
          setMessage(result.message);
          setSnackOpen(true);
        } else {
          navigate("/application/admin/plan/pay/" + newPlan);
        }
        break;
    }
    getUser();
    setLoading(false);
  };

  React.useEffect(() => {
    if (open) {
      setOperationFinished(false);
      setSuccess();
      setMessage();
      setSnackOpen(false);
    }
  }, [open]);
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
        <ModalBox sx={{ width: isMD ? "655px" : "90vw" }} title="Confirm" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              {loading ? (
                <Root>
                  <CircularProgress color="primary" />
                </Root>
              ) : operationFinished ? (
                <Typography variant="h3">
                  {("success" === success ? "Succeeded" : "Failed") +
                    " to " +
                    (action === "upgrade"
                      ? "upgrade"
                      : action === "downgrade"
                      ? "downgrade"
                      : action === "delete"
                      ? "cancel"
                      : "re-activate") +
                    " your plan."}
                </Typography>
              ) : (
                <Typography variant="h3">
                  Are you sure you want to&nbsp;
                  {action === "upgrade" ? "update" : action === "downgrade" ? "update" : action === "delete" ? "cancel" : "re-activate"}
                  &nbsp;your plan?
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="contained" color="warning" size="modal" mr={2} startIcon={<CancelIcon />} onClick={handleClose}>
                Close
              </Button>
              {!operationFinished ? (
                <Button variant="contained" color="success" size="modal" disabled={loading} startIcon={<ConfirmIcon />} onClick={confirm}>
                  Yes
                </Button>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </ModalBox>
      </Modal>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default ConfirmModal;
