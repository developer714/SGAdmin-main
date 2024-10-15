import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  TableContainer,
  CircularProgress,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import AddIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";

import {
  Button,
  CollapseAlert,
  Divider,
  IconButton,
  MenuItem,
  Root,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";
import useAdException from "../../../hooks/super/useAdException";
import useOrganisation from "../../../hooks/super/useOrganisation";
import { formatDate } from "../../../utils/format";

import DeleteAdExceptionModal from "./component/M_DeleteAdException";
import AdExceptionModal from "./component/M_AdException";
import useAuth from "../../../hooks/useAuth";
import { UserRole } from "../../../utils/constants";
import TablePagination from "../../../components/common/TablePagination";

function SAAdException() {
  const { ad_exceptions, organisation, total_ad_exception_count, from, rows_per_page, errMsg, getAdExceptions, applyAdCfg, setErr } =
    useAdException();
  const { adminRole } = useAuth();

  const { organisations, getOrganisations } = useOrganisation();

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  useEffect(() => getOrganisations(), [getOrganisations]);

  useEffect(() => {
    if (!organisations || organisations.length === 0) return;
    if (!organisation) getAdExceptions(organisations[0].id, rows_per_page, from);
  }, [organisation, organisations, getAdExceptions, rows_per_page, from]);

  // pagination
  const [page, setPage] = useState(0);
  const handlePageChange = async (e, newPage) => {
    await getAdExceptions(organisation, rows_per_page, newPage * rows_per_page);
    setPage(newPage);
  };

  const handleRowsPerPageChange = async (e) => {
    await getAdExceptions(organisation, e.target.value, 0);
    setPage(0);
  };

  const [curException, setCurException] = useState(null);

  // delete modal
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  // create / update modal
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const updateHandleOpen = () => setUpdateOpen(true);
  const updateHandleClose = () => setUpdateOpen(false);

  // snack bar
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const apply = async () => {
    setLoading(true);
    const result = await applyAdCfg();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };

  return (
    <React.Fragment>
      <Helmet title="SA AD Exception" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Anti DDoS Exception
          </Typography>
        </Grid>
        <Grid item xs />
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={null === ad_exceptions || ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            loading={loading}
            onClick={apply}
          >
            <SaveIcon sx={{ marginRight: "8px" }} /> Apply
          </Button>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h2"></Typography>
        </Grid>
        <Grid item>
          <Select
            value={organisation}
            onChange={(e) => getAdExceptions(e.target.value, rows_per_page, from)}
            sx={{
              width: "320px",
            }}
          >
            {organisations?.map((org, i) => {
              return (
                <MenuItem key={i} value={org.id}>
                  {org.title}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
        <Grid item xs />
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setCurException(null);
              updateHandleOpen();
            }}
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={null === ad_exceptions || ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            <AddIcon sx={{ marginRight: "8px" }} /> Add New Exception
          </Button>
          <IconButton ml={4} onClick={() => getAdExceptions(organisation, rows_per_page, from)} sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>IP address</TableCell>
              <TableCell>Creation Time</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ad_exceptions == null ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Root>
                    <CircularProgress color="primary" />
                  </Root>
                </TableCell>
              </TableRow>
            ) : ad_exceptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography textAlign="center">There are no registered exceptions. Please add a new exception.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              ad_exceptions.map((exception) => (
                <TableRow>
                  <TableCell>{exception?.domain}</TableCell>
                  <TableCell>{exception?.ip_list}</TableCell>
                  <TableCell>{formatDate(exception?.created_at)}</TableCell>
                  <TableCell>
                    <IconButton
                      ml={4}
                      onClick={() => {
                        setCurException(exception);
                        updateHandleOpen();
                      }}
                      sx={{ margin: "0px 0px 0px 16px" }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      ml={4}
                      onClick={() => {
                        setCurException(exception);
                        deleteHandleOpen();
                      }}
                      sx={{ margin: "0px 0px 0px 16px" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total_ad_exception_count}
        rowsPerPage={rows_per_page}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <DeleteAdExceptionModal open={deleteOpen} handleClose={deleteHandleClose} id={curException?._id} />
      <AdExceptionModal open={updateOpen} handleClose={updateHandleClose} organisation={organisation} ad_exception={curException} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAAdException;
