import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  MenuItem,
  IconButton as MuiIconButton,
  useTheme,
  Grid,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  MoreVert as MoreVertIcon,
  SettingsBackupRestore as RestoreIcon,
  DoDisturb as UnVerifiedIcon,
  CheckCircleOutline as VerifiedIcon,
  PersonOutlined as EnableIcon,
  PersonOffOutlined as DisableIcon,
  Cached,
} from "@mui/icons-material";

import useAdmin from "../../../../../hooks/user/useAdmin";

import UserModal from "./M_User";
import DeleteUserModal from "./M_DeleteUser";
import RestoreUserModal from "./M_RestoreUser";
import EnableUserModal from "./M_EnableUser";
import DisableUserModal from "./M_DisableUser";
import ViewUserModal from "./M_ViewUser";

import { formatDate, getUserRoleString } from "../../../../../utils/format";
import { Paper, StyledMenu } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";

import { ReactComponent as DownloadIcon } from "../../../../../vendor/button/download.svg";
import TablePagination from "../../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  { id: "email", alignment: "left", label: "Email" },
  { id: "firstName", alignment: "left", label: "Name" },
  { id: "role", alignment: "left", label: "Role" },
  { id: "title", alignment: "left", label: "Title" },
  { id: "created", alignment: "left", label: "Creation Date" },
  { id: "isVerified", alignment: "left", label: "Verify" },
  { id: "enabled", alignment: "left", label: "Status" },
  { id: "action", alignment: "left", label: "" },
];

const EnhancedTableHead = (props) => {
  const { users } = useAdmin();
  const {
    onSelectAllClick,
    onDeleteClick,
    onRestoreClick,
    onEnableClick,
    onDisableClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell role="checkbox" sx={{ padding: "8px" }}>
          {users === null ? (
            <></>
          ) : (
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all" }}
            />
          )}
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            sx={{ padding: "8px" }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "isDeleted" ? (
              numSelected ? (
                <Box display="flex" alignItems="center">
                  <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={onDeleteClick}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={onRestoreClick}>
                    <RestoreIcon />
                  </IconButton>
                </Box>
              ) : (
                headCell.label
              )
            ) : headCell.id === "enabled" ? (
              numSelected ? (
                <Box display="flex" alignItems="center">
                  <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={onEnableClick}>
                    <EnableIcon />
                  </IconButton>
                  <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={onDisableClick}>
                    <DisableIcon />
                  </IconButton>
                </Box>
              ) : (
                headCell.label
              )
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <Typography variant="tableHeader">{headCell.label}</Typography>
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

function SkeletonContent(props) {
  const { rowsPerPage } = props;

  var rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  var cellArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
          <TableCell sx={{ padding: "16px 8px" }} key={"s_" + r + "_0"}></TableCell>
          {cellArray.map((c) => (
            <TableCell sx={{ padding: "16px 8px" }} key={"s_" + r + "_" + c}>
              <Skeleton height="22px" width="100%" py="5px" variant="rectangular" sx={{ borderRadius: "11px" }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
SkeletonContent.propTypes = { rowsPerPage: PropTypes.number.isRequired };

function EnhancedTable({ refresh, download }) {
  const theme = useTheme();
  const { viewUser, users } = useAdmin();
  const [unDeletedUsers, setUnDeletedUsers] = React.useState(null);
  React.useEffect(() => {
    if (users === null || users === undefined) {
      setUnDeletedUsers(null);
      return;
    }
    if (users?.length === 0) {
      setUnDeletedUsers([]);
      return;
    }
    let tmp = [];
    users?.forEach((u) => {
      if (!u?.isDeleted) tmp.push(u);
    });
    setUnDeletedUsers(tmp);
  }, [users]);

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("email");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [deleted, setDeleted] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);
  const [userName, setUserName] = React.useState([]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users?.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const restoreHandleOpen = () => setRestoreOpen(true);
  const restoreHandleClose = () => setRestoreOpen(false);

  const [enableOpen, setEnableOpen] = React.useState(false);
  const enableHandleOpen = () => setEnableOpen(true);
  const enableHandleClose = () => setEnableOpen(false);

  const [disableOpen, setDisableOpen] = React.useState(false);
  const disableHandleOpen = () => setDisableOpen(true);
  const disableHandleClose = () => setDisableOpen(false);

  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

  const [uid, setUid] = React.useState(0);
  const [user, setUser] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event, id, deleted, enabled) => {
    setUid(id);
    setDeleted(deleted);
    setEnabled(enabled);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const viewClick = async () => {
    setAnchorEl(null);
    setLoading(true);
    viewHandleOpen();
    const user = await viewUser(uid);
    setUser(user);
    setLoading(false);
  };
  const editClick = async () => {
    setAnchorEl(null);
    setLoading(true);
    handleOpen();
    const user = await viewUser(uid);
    setUser(user);
    setLoading(false);
  };
  const prepareAction = () => {
    if (selected.length > 1) {
      let tmpName = [];
      users.forEach((u) => {
        if (selected.indexOf(u.id) !== -1) tmpName.push({ id: u.id, email: u.email });
      });
      setUserName(tmpName);
    } else {
      users.forEach((u) => {
        if (u.id === uid) setUserName([{ id: u.id, email: u.email }]);
      });
    }
  };
  const deleteClick = () => {
    setAnchorEl(null);
    prepareAction();
    deleteHandleOpen();
  };
  const restoreClick = () => {
    setAnchorEl(null);
    prepareAction();
    restoreHandleOpen();
  };
  const enableClick = () => {
    setAnchorEl(null);
    prepareAction();
    enableHandleOpen();
  };
  const disableClick = () => {
    setAnchorEl(null);
    prepareAction();
    disableHandleOpen();
  };
  return (
    <div>
      <Grid
        container
        sx={{
          paddingX: "16px",
          display: "flex",
          alignItems: "center",
          height: "50px",
          background: theme.palette.custom.yellow.opacity_50,
          borderRadius: "2px",
        }}
      >
        <Grid item>
          <Typography>{selected.length} rows selected.</Typography>
        </Grid>
        <Grid item xs />
        <Grid item alignItems="center">
          <Button variant="text" startIcon={<Cached />} onClick={refresh}>
            Refresh
          </Button>
          <Button variant="text" startIcon={<DownloadIcon />} onClick={download}>
            Download
          </Button>
        </Grid>
      </Grid>
      <Paper sx={{ maxWidth: "90vw", boxShadow: "none", marginTop: "16px" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              selected={selected}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onDeleteClick={deleteClick}
              onRestoreClick={restoreClick}
              onEnableClick={enableClick}
              onDisableClick={disableClick}
              onRequestSort={handleRequestSort}
              rowCount={unDeletedUsers === null ? 0 : unDeletedUsers?.length}
            />
            {unDeletedUsers === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : unDeletedUsers.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no registered users. Please add a new user.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(unDeletedUsers, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row?.id);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={`${row?.id}-${index}`}
                        selected={isItemSelected}
                      >
                        <TableCell role="checkbox" sx={{ padding: "8px" }}>
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(event) => handleClick(event, row?.id)}
                          />
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {row?.email}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {row?.firstName + " " + row?.lastName}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {getUserRoleString(row?.role)}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {row?.title}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {formatDate(row?.created)}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {row?.isVerified ? <VerifiedIcon sx={{ color: "#369F33" }} /> : <UnVerifiedIcon sx={{ color: "#E60000" }} />}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {row?.enabled ? (
                            <Grid display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: "10px",
                                  height: "10px",
                                  marginRight: "5px",
                                  background: theme.palette.custom.green.main,
                                  borderRadius: "10px",
                                }}
                              />
                              <Typography>Enable</Typography>
                            </Grid>
                          ) : (
                            <Grid display="flex" alignItems="center">
                              <Box
                                sx={{
                                  width: "10px",
                                  height: "10px",
                                  marginRight: "5px",
                                  background: theme.palette.custom.red.main,
                                  borderRadius: "10px",
                                }}
                              />
                              <Typography>Disable</Typography>
                            </Grid>
                          )}
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          {1 > selected.length && (
                            <IconButton
                              size="large"
                              id="demo-customized-button"
                              aria-controls={openMore ? "demo-customized-menu" : undefined}
                              aria-haspopup="true"
                              aria-expanded={openMore ? "true" : undefined}
                              onClick={(event) => handleClickMore(event, row?.id, row?.isDeleted, row?.enabled)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={unDeletedUsers === null ? 0 : unDeletedUsers?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <UserModal open={open} handleClose={handleClose} user={user} loading={loading} />
      <ViewUserModal open={viewOpen} handleClose={viewHandleClose} user={user} loading={loading} />
      <DeleteUserModal open={deleteOpen} handleClose={deleteHandleClose} uid={0 < selected.length ? selected : uid} userName={userName} />
      <RestoreUserModal
        open={restoreOpen}
        handleClose={restoreHandleClose}
        uid={0 < selected.length ? selected : uid}
        userName={userName}
      />
      <EnableUserModal open={enableOpen} handleClose={enableHandleClose} uid={0 < selected.length ? selected : uid} userName={userName} />
      <DisableUserModal
        open={disableOpen}
        handleClose={disableHandleClose}
        uid={0 < selected.length ? selected : uid}
        userName={userName}
      />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={viewClick} disableRipple>
          <RemoveRedEyeIcon />
          View
        </MenuItem>
        <MenuItem onClick={editClick} disableRipple>
          <EditIcon />
          Edit
        </MenuItem>
        {enabled ? (
          <MenuItem onClick={disableClick} disableRipple>
            <DisableIcon />
            Disable
          </MenuItem>
        ) : (
          <MenuItem onClick={enableClick} disableRipple>
            <EnableIcon />
            Enable
          </MenuItem>
        )}
        {deleted ? (
          // <MenuItem onClick={restoreClick} disableRipple>
          //     <RestoreIcon />
          //     Restore
          // </MenuItem> 
          null
        ) : (
          <MenuItem onClick={deleteClick} disableRipple>
            <DeleteIcon />
            Delete
          </MenuItem>
        )}
      </StyledMenu>
    </div>
  );
}
function UserTable({ refresh, download }) {
  return <EnhancedTable refresh={refresh} download={download} />;
}
export default UserTable;
