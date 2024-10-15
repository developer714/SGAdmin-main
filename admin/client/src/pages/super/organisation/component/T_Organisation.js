import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import {
  Typography,
  Checkbox,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
  MenuItem,
  IconButton as MuiIconButton,
} from "@mui/material";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import SettingIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import UserIcon from "@mui/icons-material/PersonOutlineOutlined";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";

import DeleteOrganisationModal from "./M_DeleteOrganisation";
import RestoreOrganisationModal from "./M_RestoreOrganisation";
import EditOrganisationModal from "./M_EditOrganisation";

import useOrganisation from "../../../../hooks/super/useOrganisation";
import useAuth from "../../../../hooks/useAuth";
import { formatDate } from "../../../../utils/format";
import { UserRole } from "../../../../utils/constants";

import { setOrganisationSession, setOrganisationName, setOrganisationAdmin } from "../../../../utils/jwt";
import { getLicenseLevelString } from "../../../../components/pages/application/admin/paywall/common";
import { Paper, StyledMenu, TextField } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "title",
    alignment: "left",
    label: "Organisation",
  },
  {
    id: "sites",
    alignment: "left",
    label: "Site",
  },
  {
    id: "users",
    alignment: "left",
    label: "User",
  },
  {
    id: "license",
    alignment: "left",
    label: "Plan",
  },
  {
    id: "current_period_end",
    alignment: "left",
    label: "Expiry",
  },
  {
    id: "email",
    alignment: "left",
    label: "Admin Email",
  },
  {
    id: "username",
    alignment: "left",
    label: "Admin Name",
  },
  {
    id: "created",
    alignment: "left",
    label: "Creation Date",
  },
  {
    id: "isDeleted",
    alignment: "left",
    label: "Status",
  },
  {
    id: "action",
    alignment: "left",
    label: "",
  },
];

const EnhancedTableHead = (props) => {
  const { organisations } = useOrganisation();
  const { onSelectAllClick, onDeleteClick, onRestoreClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        <TableCell role="checkbox" sx={{ padding: "8px" }}>
          {organisations === null ? (
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
            {"action" === headCell.id ? (
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
                <></>
              )
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.icon}
                <Typography variant="tableHeader">{headCell.label}</Typography>
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;
  const [_page, set_page] = React.useState(page);
  React.useEffect(() => {
    set_page(page + 1);
  }, [page]);

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };
  const handleCustomTextChange = (event) => {
    if (event.key === "Enter") {
      if (event.target.value > Math.max(0, Math.ceil(count / rowsPerPage) - 1)) {
        set_page(Math.max(0, Math.ceil(count / rowsPerPage)));
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
      } else if (event.target.value < 1) {
        set_page(1);
        onPageChange(event, 0);
      } else {
        set_page(event.target.value);
        onPageChange(event, event.target.value - 1);
      }
    }
  };
  const handlePageChange = (event) => {
    set_page(event.target.value);
  };
  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", ml: 4 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <TextField
        onKeyDown={handleCustomTextChange}
        onChange={handlePageChange}
        type="number"
        variant="standard"
        value={_page}
        InputProps={{
          inputProps: {
            style: { textAlign: "center" },
          },
        }}
      />
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
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
  const { organisations, total_organisation_count, from, rows_per_page, getOrganisations } = useOrganisation();
  const { adminRole, setUserRole, setUserLicense, getFeatures } = useAuth();

  var totalCount = total_organisation_count;

  const [orgID, setOrgID] = React.useState();
  const [orgName, setOrgName] = React.useState([]);
  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [selected, setSelected] = React.useState([]);

  React.useEffect(() => {
    setPage(from / rows_per_page);
  }, [from, rows_per_page]);
  React.useEffect(() => {
    setRowsPerPage(rows_per_page);
  }, [rows_per_page]);
  React.useEffect(() => {
    setSelected([]);
  }, [organisations]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = organisations?.map((n) => n.id);
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

  const isSelected = (id) => selected?.indexOf(id) !== -1;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);

  const handleClickMore = (event, id, deleted) => {
    setOrgID(id);
    setDeleted(deleted);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);
  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const restoreHandleOpen = () => setRestoreOpen(true);
  const restoreHandleClose = () => setRestoreOpen(false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getOrganisations(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getOrganisations(parseInt(event.target.value, 10), 0, false);
  };
  const configurationClick = async () => {
    setAnchorEl(null);
    setOrganisationSession(orgID);
    for (const org of organisations) {
      if (org.id === orgID) {
        setOrganisationName(org.title);
        setOrganisationAdmin(org.admin?.email);
        setUserRole(UserRole.ORGANISATION_ACCOUNT);
        setUserLicense(org.license);
        await getFeatures();
        break;
      }
    }
    navigate("/home");
  };
  const userClick = () => {
    setAnchorEl(null);
    navigate("/super/application/user/list/" + orgID);
  };
  const prepareAction = () => {
    if (selected.length > 1) {
      let tmpName = [];
      organisations.forEach((org) => {
        if (selected.indexOf(org.id) !== -1) tmpName.push({ id: org.id, title: org.title });
      });
      setOrgName(tmpName);
    } else {
      organisations.forEach((org) => {
        if (org.id === orgID) setOrgName([{ id: org.id, title: org.title }]);
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
  const editClick = () => {
    setAnchorEl(null);
    organisations.forEach((org) => {
      if (org.id === orgID) setOrgName([{ id: org.id, title: org.title }]);
    });
    handleOpen();
  };
  return (
    <>
      <Paper>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected?.length}
              selected={selected}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              onDeleteClick={deleteClick}
              onRestoreClick={restoreClick}
              rowCount={totalCount}
            />
            {organisations === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : organisations.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no organisations</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(organisations, getComparator(order, orderBy)).map((row, index) => {
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
                        {row?.title}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.sites}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.users}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {getLicenseLevelString(row?.license)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.current_period_end &&
                          (new Date(row?.current_period_end) > new Date() ? (
                            formatDate(row?.current_period_end)
                          ) : (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                border: "solid 1px #E60000",
                                borderRadius: "20px",
                                width: "fit-content",
                              }}
                            >
                              {formatDate(row?.current_period_end)}
                            </Typography>
                          ))}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.admin?.email}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.admin?.username}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {formatDate(row?.created)}
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
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {1 > selected.length && (
                          <IconButton
                            size="large"
                            id="demo-customized-button"
                            aria-controls={openMore ? "demo-customized-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMore ? "true" : undefined}
                            onClick={(event) => handleClickMore(event, row?.id, row?.isDeleted)}
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            inputProps: {
              "aria-label": "rows per page",
            },
            native: true,
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
      <DeleteOrganisationModal
        open={deleteOpen}
        handleClose={deleteHandleClose}
        orgID={0 < selected.length ? selected : orgID}
        orgName={orgName}
        removeFlag={removeFlag}
      />
      <RestoreOrganisationModal
        open={restoreOpen}
        handleClose={restoreHandleClose}
        orgID={0 < selected.length ? selected : orgID}
        orgName={orgName}
      />
      <EditOrganisationModal open={open} handleClose={handleClose} orgName={orgName} />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        {[UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) ? (
          <MenuItem onClick={configurationClick} disableRipple>
            <SettingIcon />
            Configuration
          </MenuItem>
        ) : (
          <></>
        )}

        <MenuItem onClick={userClick} disableRipple>
          <UserIcon />
          Users
        </MenuItem>
        {[UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole) ? (
          <>
            <MenuItem onClick={editClick} disableRipple>
              <EditIcon />
              Edit
            </MenuItem>
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
        ) : (
          <></>
        )}
      </StyledMenu>
    </>
  );
}
function OrganisationList() {
  return <EnhancedTable />;
}
export default OrganisationList;
