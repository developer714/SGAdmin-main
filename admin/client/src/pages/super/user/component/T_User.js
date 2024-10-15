import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  Settings as ImpersonateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  MoreVert as MoreVertIcon,
  SettingsBackupRestore as RestoreIcon,
  DoDisturb as UnVerifiedIcon,
  CheckCircleOutline as VerifiedIcon,
  PersonOutlined as EnableIcon,
  PersonOffOutlined as DisableIcon,
} from "@mui/icons-material";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";

import useUser from "../../../../hooks/super/useUser";
import useAuth from "../../../../hooks/useAuth";

import UserModal from "./M_User";
import DeleteUserModal from "./M_DeleteUser";
import RestoreUserModal from "./M_RestoreUser";
import EnableUserModal from "./M_EnableUser";
import DisableUserModal from "./M_DisableUser";
import VerifyUserModal from "./M_VerifyUser";
import ViewUserModal from "./M_ViewUser";

import { formatDate, getUserRoleString } from "../../../../utils/format";
import { Paper, StyledMenu } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import { UserRole } from "../../../../utils/constants";
import TablePagination from "../../../../components/common/TablePagination";
const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "email",
    alignment: "left",
    label: "Email",
  },
  {
    id: "firstName",
    alignment: "left",
    label: "Name",
  },
  {
    id: "role",
    alignment: "left",
    label: "Role",
  },
  {
    id: "title",
    alignment: "left",
    label: "Title",
  },
  {
    id: "created",
    alignment: "left",
    label: "Creation Date",
  },
  {
    id: "isVerified",
    alignment: "left",
    label: "Verify",
  },
  {
    id: "enabled",
    alignment: "left",
    label: "Status 1",
  },
  {
    id: "isDeleted",
    alignment: "left",
    label: "Status 2",
  },
  {
    id: "action",
    alignment: "left",
    label: "",
  },
];

const EnhancedTableHead = (props) => {
  const { users } = useUser();
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
            sx={{
              padding: "8px",
            }}
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

  var cellArray = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
          <TableCell
            sx={{
              padding: "16px 8px",
            }}
            key={"s_" + r + "_0"}
          ></TableCell>
          {cellArray.map((c) => (
            <TableCell
              sx={{
                padding: "16px 8px",
              }}
              key={"s_" + r + "_" + c}
            >
              <Skeleton
                height="22px"
                width="100%"
                py="5px"
                variant="rectangular"
                sx={{
                  borderRadius: "11px",
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
SkeletonContent.propTypes = {
  rowsPerPage: PropTypes.number.isRequired,
};
function EnhancedTable() {
  const navigate = useNavigate();
  const { viewUser, impersonateUser, users } = useUser();
  const { adminRole, setImpersonate, getFeatures } = useAuth();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("created");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);
  const [verified, setVerified] = React.useState(false);
  const [email, setEmail] = React.useState();
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

  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const verifyHandleOpen = () => setVerifyOpen(true);
  const verifyHandleClose = () => setVerifyOpen(false);

  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

  const [uid, setUid] = React.useState(0);
  const [user, setUser] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event, id, deleted, enabled, verified, email) => {
    setUid(id);
    setDeleted(deleted);
    setEnabled(enabled);
    setVerified(verified);
    setEmail(email);
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
    setRemoveFlag(false);
    prepareAction();
    deleteHandleOpen();
  };
  const removeClick = () => {
    setAnchorEl(null);
    setRemoveFlag(true);
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
  const verifyClick = () => {
    setAnchorEl(null);
    prepareAction();
    verifyHandleOpen();
  };
  const impersonateClick = async () => {
    setAnchorEl(null);
    const user = await impersonateUser(email);
    await setImpersonate(user);
    await getFeatures();
    navigate("/home");
  };
  return (
    <div>
      <Paper sx={{ maxWidth: "90vw" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected.length}
              selected={selected}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onDeleteClick={deleteClick}
              onRestoreClick={restoreClick}
              onEnableClick={enableClick}
              onDisableClick={disableClick}
              onRequestSort={handleRequestSort}
              rowCount={users === null ? 0 : users?.length}
            />
            {users === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : users.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography textAlign="center">There are no registered users. Please add a new user.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(users, getComparator(order, orderBy))
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
                        <TableCell
                          role="checkbox"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{
                              "aria-labelledby": labelId,
                            }}
                            onClick={(event) => handleClick(event, row?.id)}
                          />
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.email}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.firstName + " " + row?.lastName}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {getUserRoleString(row?.role)}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.title}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.created && formatDate(row?.created)}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.isVerified ? (
                            <VerifiedIcon
                              sx={{
                                color: "#369F33",
                              }}
                            />
                          ) : (
                            <UnVerifiedIcon
                              sx={{
                                color: "#E60000",
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.enabled ? (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                backgroundColor: "#369F33",
                                borderRadius: "20px",
                                color: "white",
                                width: "fit-content",
                              }}
                            >
                              Enable
                            </Typography>
                          ) : (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                backgroundColor: "#E60000",
                                borderRadius: "20px",
                                color: "white",
                                width: "fit-content",
                              }}
                            >
                              Disable
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.isDeleted ? (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                backgroundColor: "#E60000",
                                borderRadius: "20px",
                                color: "white",
                                width: "fit-content",
                              }}
                            >
                              Deleted
                            </Typography>
                          ) : (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                backgroundColor: "#369F33",
                                borderRadius: "20px",
                                color: "white",
                                width: "fit-content",
                              }}
                            >
                              Active
                            </Typography>
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
                              onClick={(event) =>
                                handleClickMore(event, row?.id, row?.isDeleted, row?.enabled, row?.isVerified, row?.email)
                              }
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
          count={users === null ? 0 : users?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <UserModal open={open} handleClose={handleClose} user={user} loading={loading} />
      <ViewUserModal open={viewOpen} handleClose={viewHandleClose} user={user} loading={loading} />
      <DeleteUserModal
        open={deleteOpen}
        handleClose={deleteHandleClose}
        uid={0 < selected.length ? selected : uid}
        userName={userName}
        removeFlag={removeFlag}
      />
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
      <VerifyUserModal open={verifyOpen} handleClose={verifyHandleClose} email={email} userName={userName} />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        {[UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) && (
          <MenuItem onClick={impersonateClick} disableRipple>
            <ImpersonateIcon />
            Impersonate
          </MenuItem>
        )}

        <MenuItem onClick={viewClick} disableRipple>
          <RemoveRedEyeIcon />
          View
        </MenuItem>
        {[UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole) && (
          <>
            <MenuItem onClick={editClick} disableRipple>
              <EditIcon />
              Edit
            </MenuItem>
            {!verified && (
              <MenuItem onClick={verifyClick} disableRipple>
                <VerifiedIcon />
                Verify
              </MenuItem>
            )}
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
              <MenuItem onClick={restoreClick} disableRipple>
                <RestoreIcon />
                Restore
              </MenuItem>
            ) : (
              <MenuItem onClick={deleteClick} disableRipple>
                <DeleteIcon />
                Delete
              </MenuItem>
            )}
            <hr />
            <MenuItem onClick={removeClick} disableRipple>
              <RemoveIcon />
              Remove
            </MenuItem>
          </>
        )}
      </StyledMenu>
    </div>
  );
}
function UserTable() {
  return <EnhancedTable />;
}
export default UserTable;
