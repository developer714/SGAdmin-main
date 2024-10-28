import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";

import {
  Typography,
  // Checkbox,
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
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";

import DisableNotificationModal from "./M_DisableNotification";
import EnableNotificationModal from "./M_EnableNotification";
import ViewNotificationModal from "./M_ViewNotification";
import EditNotificationModal from "./M_Notification";

import useGeneral from "../../../../hooks/super/useGeneral";
import { formatDate } from "../../../../utils/format";
import { Paper, StyledMenu, TextField } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import useAuth from "../../../../hooks/useAuth";
import { UserRole } from "../../../../utils/constants";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "title",
    alignment: "left",
    label: "Title",
  },
  {
    id: "content",
    alignment: "left",
    label: "Content",
  },
  {
    id: "created",
    alignment: "left",
    label: "Creation Date",
  },
  {
    id: "enabled",
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
  // const { notifications } = useWAFEdge();
  const {
    // onSelectAllClick,
    // onDeleteClick,
    // onRestoreClick,
    order,
    orderBy,
    // numSelected,
    // rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  headCells[0].label = "Title";
  return (
    <TableHead>
      <TableRow>
        {/* <TableCell role="checkbox" sx={{ padding: "8px" }}>
                    {notifications === null ? (
                        <></>
                    ) : (
                        <Checkbox
                            indeterminate={
                                numSelected > 0 && numSelected < rowCount
                            }
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{ "aria-label": "select all" }}
                        />
                    )}
                </TableCell> */}
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
            {/* {"action" === headCell.id ? (
                            numSelected ? (
                                <Box display="flex" alignItems="center">
                                    <IconButton
                                        size="large"
                                        id="demo-customized-button"
                                        aria-haspopup="true"
                                        onClick={onDeleteClick}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton
                                        size="large"
                                        id="demo-customized-button"
                                        aria-haspopup="true"
                                        onClick={onRestoreClick}
                                    >
                                        <RestoreIcon />
                                    </IconButton>
                                </Box>
                            ) : (
                                <></>
                            )
                        ) : ( */}
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.icon}
              <Typography variant="tableHeader">{headCell.label}</Typography>
            </TableSortLabel>
            {/* )} */}
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

  var cellArray = [1, 2, 3, 4];

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
          {/* <TableCell
                        sx={{
                            padding: "16px 8px",
                        }}
                        key={"s_" + r + "_0"}
                    ></TableCell> */}
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
  const { notifications, total, from, size, getNotifications, viewNotification } = useGeneral();
  const { adminRole } = useAuth();
  var totalCount = total;
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("isActive");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  // const [selected, setSelected] = React.useState([]);

  React.useEffect(() => {
    setPage(from / size);
  }, [from]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setRowsPerPage(size);
  }, [size]); // eslint-disable-line react-hooks/exhaustive-deps
  // React.useEffect(() => {
  //     setSelected([]);
  // }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  // const handleSelectAllClick = (event) => {
  //     if (event.target.checked) {
  //         const newSelecteds = notifications?.map((n) => n.id);
  //         setSelected(newSelecteds);
  //         return;
  //     }
  //     setSelected([]);
  // };
  // const handleClick = (event, id) => {
  //     const selectedIndex = selected.indexOf(id);
  //     let newSelected = [];

  //     if (selectedIndex === -1) {
  //         newSelected = newSelected.concat(selected, id);
  //     } else if (selectedIndex === 0) {
  //         newSelected = newSelected.concat(selected.slice(1));
  //     } else if (selectedIndex === selected.length - 1) {
  //         newSelected = newSelected.concat(selected.slice(0, -1));
  //     } else if (selectedIndex > 0) {
  //         newSelected = newSelected.concat(
  //             selected.slice(0, selectedIndex),
  //             selected.slice(selectedIndex + 1)
  //         );
  //     }

  //     setSelected(newSelected);
  // };

  // const isSelected = (id) => selected?.indexOf(id) !== -1;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const [loading, setLoading] = React.useState(false);
  const [notiID, setNotiID] = React.useState();
  const [notiTitle, setNotiTitle] = React.useState();
  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);
  const [notification, setNotification] = React.useState();

  const handleClickMore = (event, id, name, deleted) => {
    setAnchorEl(event.currentTarget);
    setNotiID(id);
    setNotiTitle(name);
    setDeleted(deleted);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getNotifications(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getNotifications(parseInt(event.target.value, 10), 0, false);
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const enableHandleOpen = () => setRestoreOpen(true);
  const restoreHandleClose = () => setRestoreOpen(false);

  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

  const viewClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    viewHandleOpen();
    setNotification(await viewNotification(notiID));
    setLoading(false);
  };
  const editClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    handleOpen();
    setNotification(await viewNotification(notiID));
    setLoading(false);
  };
  const disableClick = () => {
    setAnchorEl(null);
    setRemoveFlag(false);
    deleteHandleOpen();
  };
  const deleteClick = () => {
    setAnchorEl(null);
    setRemoveFlag(true);
    deleteHandleOpen();
  };
  const enableClick = () => {
    setAnchorEl(null);
    enableHandleOpen();
  };
  return (
    <>
      <Paper>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              // numSelected={selected?.length}
              // selected={selected}
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
            // onDeleteClick={disableClick}
            // onRestoreClick={enableClick}
            // rowCount={totalCount}
            />
            {notifications === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : notifications.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no notifications</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(notifications, getComparator(order, orderBy)).map((row, index) => {
                  // const isItemSelected = isSelected(row?.id);
                  // const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      // role="checkbox"
                      // aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row?.id}-${index}`}
                    // selected={isItemSelected}
                    >
                      {/* <TableCell
                                                role="checkbox"
                                                sx={{
                                                    padding: "8px",
                                                }}
                                            >
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        "aria-labelledby":
                                                            labelId,
                                                    }}
                                                    onClick={(event) =>
                                                        handleClick(
                                                            event,
                                                            row?.id
                                                        )
                                                    }
                                                />
                                            </TableCell> */}
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
                        {row?.content}
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
                            Active
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
                            Inactive
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {/* {1 > selected.length && ( */}
                        <IconButton
                          size="large"
                          id="demo-customized-button"
                          aria-controls={openMore ? "demo-customized-menu" : undefined}
                          aria-haspopup="true"
                          aria-expanded={openMore ? "true" : undefined}
                          onClick={(event) => handleClickMore(event, row?.id, row?.title, !row?.enabled)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        {/* )} */}
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
      <EditNotificationModal open={open} handleClose={handleClose} notification={notification} loading={loading} />
      <ViewNotificationModal open={viewOpen} handleClose={viewHandleClose} notification={notification} loading={loading} />
      <DisableNotificationModal open={deleteOpen} handleClose={deleteHandleClose} id={notiID} name={notiTitle} removeFlag={removeFlag} />
      <EnableNotificationModal open={restoreOpen} handleClose={restoreHandleClose} id={notiID} name={notiTitle} />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={viewClick} disableRipple>
          <RemoveRedEyeIcon />
          View
        </MenuItem>
        {[UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) && (
          [
            <MenuItem onClick={editClick} disableRipple key={0}>
              <EditIcon />
              Edit
            </MenuItem>,
            deleted ? (
              <MenuItem onClick={enableClick} disableRipple key={1}>
                <RestoreIcon />
                Enable
              </MenuItem>
            ) : (
              <MenuItem onClick={disableClick} disableRipple key={1}>
                <RemoveIcon />
                Disable
              </MenuItem>
            ),
            <hr key={2} />,
            <MenuItem onClick={deleteClick} disableRipple key={3}>
              <DeleteIcon />
              Delete
            </MenuItem>
          ]
        )}
      </StyledMenu>
    </>
  );
}
function NotificationTable({ type }) {
  return <EnhancedTable type={type} />;
}
export default NotificationTable;
