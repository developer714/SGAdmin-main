import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  MenuItem,
  Box,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import copy from "copy-to-clipboard";

import { SnackbarAlert, StyledMenu } from "../../../components/pages/application/common/styled";

import useKey from "../../../hooks/user/useKey";
import { formatDate } from "../../../utils/format";

import DeleteAPIKeyModal from "../../../components/pages/application/profile/M_DeleteAPIKey";
import UpdateAPIKeyModal from "../../../components/pages/application/profile/M_UpdateAPIKey";
import { MoreVert } from "@mui/icons-material";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

const statusLabel = ["Active", "Revoked", "Expired"];

function PersonalAPIKey() {
  const theme = useTheme();

  // const navigate = useNavigate();
  const { keys, labels, getAllAPIKey } = useKey();
  // console.log(labels);

  const [deleteKeyID, setDeleteKeyID] = useState(0);
  const [openDelete, setOpenDelete] = useState(false);
  const handleDeleteOpen = () => setOpenDelete(true);
  const handleDeleteClose = () => setOpenDelete(false);

  const [keyToUpdate, setKeyToUpdate] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const handleCreateOpen = () => setOpenCreate(true);
  const handleCreateClose = () => setOpenCreate(false);

  const [showKeys, setShowKeys] = useState([]);

  const [keyID, setKeyId] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMore = !!anchorEl;

  const handleCloseMore = () => {
    setAnchorEl(null);
  };
  const handleClickMore = (event, id) => {
    setAnchorEl(event.currentTarget);
    setKeyId(id);
  };

  useEffect(() => {
    if (keys) {
      setShowKeys(Array(keys.length).fill(false));
    }
  }, [keys]);

  const [snackOpen, setSnackOpen] = useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const getPermissionLabel = (id) => {
    let tmp = "";
    Object.keys(labels)?.map((key) => {
      if (labels?.[key]?.value === id) tmp = labels?.[key]?.title;
      return 1;
    });
    return tmp;
  };

  useEffect(() => {
    getAllAPIKey();
  }, [getAllAPIKey]);
  return (
    <React.Fragment>
      <Helmet title="API Keys" />
      <Grid container pt={9} pb={6}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            API Keys
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setKeyToUpdate();
              handleCreateOpen();
            }}
          >
            Add API Key
          </Button>
        </Grid>
      </Grid>
      {keys === null ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Permission</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys?.map((item, idx) => {
              return (
                <TableRow key={"api_key_" + idx}>
                  <TableCell>{item?.name}</TableCell>
                  <TableCell>
                    <Box sx={{ width: "100%", wordBreak: "break-all" }}>
                      {showKeys[idx] ? item?.key : item?.key?.substr(0, 4) + "*".repeat(item?.key?.length) + item?.key?.substr(-4)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: "100%", wordBreak: "break-word" }}>
                      {item?.permissions?.map((id) => getPermissionLabel(id)).join(", ")}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Grid display="flex" alignItems="center">
                      <Box
                        mr={2}
                        sx={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "10px",
                          background: item?.status ? theme.palette.custom.red.main : theme.palette.custom.green.main,
                        }}
                      />
                      <Typography>{statusLabel[item?.status]}</Typography>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    <Typography color={new Date(item?.expires_at) < new Date() ? "#E60000" : ""}>{formatDate(item?.expires_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="large"
                      id="demo-customized-button"
                      aria-controls={openMore ? "demo-customized-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={openMore ? "true" : undefined}
                      onClick={(event) => handleClickMore(event, idx)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {keys?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  No API Keys
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem
          onClick={() => {
            let tempArr = [...showKeys];
            tempArr[keyID] = !tempArr[keyID];
            setShowKeys(tempArr);
            handleCloseMore();
          }}
          disableRipple
        >
          {!showKeys[keyID] ? <VisibilityIcon /> : <VisibilityOffIcon />}
          {!showKeys[keyID] ? "Show key" : "Hide key"}
        </MenuItem>
        <MenuItem
          onClick={() => {
            copy(keys[keyID]?.key);
            setSnackOpen(true);
            handleCloseMore();
          }}
          disableRipple
        >
          <ContentCopyIcon />
          Copy
        </MenuItem>
        <MenuItem
          disabled={!keys || keys?.[keyID]?.status !== 0}
          onClick={() => {
            setKeyToUpdate(keys[keyID]);
            handleCreateOpen();
            handleCloseMore();
          }}
          disableRipple
        >
          <EditIcon />
          Edit
        </MenuItem>
        <MenuItem
          disabled={!keys || keys[keyID]?.status !== 0}
          onClick={() => {
            setDeleteKeyID(keys[keyID]._id);
            handleDeleteOpen();
            handleCloseMore();
          }}
          disableRipple
        >
          <DeleteIcon />
          Delete
        </MenuItem>
      </StyledMenu>
      <DeleteAPIKeyModal open={openDelete} handleClose={handleDeleteClose} keyID={deleteKeyID} />
      <UpdateAPIKeyModal open={openCreate} handleClose={handleCreateClose} apiKey={keyToUpdate} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={"success"} message={"Copied!"} />
    </React.Fragment>
  );
}
export default PersonalAPIKey;
