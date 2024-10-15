import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, CircularProgress } from "@mui/material";

import useSite from "../../../../hooks/user/useSite";
import useAuth from "../../../../hooks/useAuth";

import { ModalButton as Button } from "../common/styled";

// import { Close as CloseIcon } from "@mui/icons-material";
import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";
import ModalBox from "../../../common/ModalBox";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteSiteModal({ open, handleClose, siteID, deleteFlag, removeFlag }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);
  const { deleteSite, restoreSite, getSites, getSitesForList } = useSite();
  const { setWebsiteController } = useAuth();
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
        <ModalBox
          sx={{ width: isMD ? "640px" : "90vw", background: "white!important" }}
          handleClose={handleClose}
          title={removeFlag ? "Remove Site" : deleteFlag ? "Delete Site" : "Restore Site"}
        >
          {deleting ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Grid container pt={4}>
              <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
                {removeFlag && "Are you sure you want to permanently remove the following site(s)? "}
                {removeFlag && <br />}
                {removeFlag
                  ? "If you remove the following site(s), you can't recover them forever."
                  : deleteFlag
                  ? "Are you sure you want to permanently delete the following site(s)?"
                  : "Are you sure you want to permanently restore the following site(s)?"}
                <br />
                {"string" === typeof siteID ? (
                  <>
                    <br />
                    {siteID}
                  </>
                ) : "object" === typeof siteID && Array.isArray(siteID) && 0 < siteID.length ? (
                  siteID.map((site_id) => (
                    <>
                      <br />
                      {site_id}
                    </>
                  ))
                ) : (
                  <></>
                )}
              </Grid>
              <Grid item xs={12} mt={10} textAlign={"right"}>
                <Button variant="outlined" color="primary" size="modal" onClick={handleClose} mr={4} startIcon={<CancelIcon />}>
                  No
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="modal"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    let res;
                    if (deleteFlag) {
                      res = await deleteSite(siteID, removeFlag);
                    } else {
                      res = await restoreSite(siteID);
                    }
                    if (res) {
                      getSitesForList();
                      getSites(setWebsiteController);
                    }
                    setDeleting(false);
                    handleClose();
                  }}
                  startIcon={<ConfirmIcon />}
                >
                  Yes
                </Button>
              </Grid>
            </Grid>
          )}
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteSiteModal;
