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

import DeleteWAFModal from "./M_DeleteWAF";
import RestoreWAFModal from "./M_RestoreWAF";
import ViewWAFModal from "./M_ViewWAF";
import ViewEsNodeModal from "./M_ViewEsNode";
import WAFModal from "./M_WAF";
import EsNodeModal from "./M_EsNode";

import { getWAFHook } from "../../../../hooks/super/nodes/useWAFEdge";
import { formatDate } from "../../../../utils/format";
import { UserRole, WafNodeType } from "../../../../utils/constants";

import { Paper, StyledMenu, TextField } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import useAuth from "../../../../hooks/useAuth";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "name",
    alignment: "left",
    label: "WAF Edge",
  },
  {
    id: "cname",
    alignment: "left",
    label: "Cname",
  },
  {
    id: "ip",
    alignment: "left",
    label: "IP Address",
  },
  {
    id: "port",
    alignment: "left",
    label: "Port",
  },
  {
    id: "created_date",
    alignment: "left",
    label: "Creation Date",
  },
  {
    id: "isActive",
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
  // const { wafEdges } = useWAFEdge();
  const {
    // onSelectAllClick,
    // onDeleteClick,
    // onRestoreClick,
    type,
    order,
    orderBy,
    // numSelected,
    // rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  if (WafNodeType.RL_ENGINE === type) {
    headCells[0].label = "RL Engine";
  } else if (WafNodeType.BM_ENGINE === type) {
    headCells[0].label = "BM Engine";
  } else if (WafNodeType.AD_ENGINE === type) {
    headCells[0].label = "AD Engine";
  } else if (WafNodeType.ES_ENGINE === type) {
    headCells[0].label = "ES Engine";
  } else if (WafNodeType.OMB_SERVICE === type) {
    headCells[0].label = "OMB Service";
  } else {
    headCells[0].label = "WAF Engine";
  }
  return (
    <TableHead>
      <TableRow>
        {/* <TableCell role="checkbox" sx={{ padding: "8px" }}>
                    {wafEdges === null ? (
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

  var cellArray = [1, 2, 3, 4, 5, 6, 7];

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
function EnhancedTable({ type }) {
  const { wafEdges, total, from, size, getWAF, viewWAF } = getWAFHook(type)();
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
  // }, [wafEdges]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  // const handleSelectAllClick = (event) => {
  //     if (event.target.checked) {
  //         const newSelecteds = wafEdges?.map((n) => n.id);
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
  const [wafID, setWafID] = React.useState();
  const [wafName, setWafName] = React.useState();
  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);
  const [waf, setWaf] = React.useState();

  const handleClickMore = (event, id, name, deleted) => {
    setAnchorEl(event.currentTarget);
    setWafID(id);
    setWafName(name);
    setDeleted(deleted);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getWAF(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getWAF(parseInt(event.target.value, 10), 0, false);
  };
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  const [restoreOpen, setRestoreOpen] = React.useState(false);
  const restoreHandleOpen = () => setRestoreOpen(true);
  const restoreHandleClose = () => setRestoreOpen(false);

  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

  const viewClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    viewHandleOpen();
    setWaf(await viewWAF(wafID));
    setLoading(false);
  };
  const editClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    handleOpen();
    setWaf(await viewWAF(wafID));
    setLoading(false);
  };
  const deleteClick = () => {
    setAnchorEl(null);
    setRemoveFlag(false);
    deleteHandleOpen();
  };
  const removeClick = () => {
    setAnchorEl(null);
    setRemoveFlag(true);
    deleteHandleOpen();
  };
  const restoreClick = () => {
    setAnchorEl(null);
    restoreHandleOpen();
  };
  return (
    <>
      <Paper>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              // numSelected={selected?.length}
              // selected={selected}
              type={type}
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              // onDeleteClick={deleteClick}
              // onRestoreClick={restoreClick}
              // rowCount={totalCount}
            />
            {wafEdges === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : wafEdges.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">
                      There are no
                      {WafNodeType.RL_ENGINE === type
                        ? " RL engines"
                        : WafNodeType.BM_ENGINE === type
                        ? " BM engines"
                        : WafNodeType.AD_ENGINE === type
                        ? " AD engines"
                        : WafNodeType.ES_ENGINE === type
                        ? " ES engines"
                        : WafNodeType.OMB_SERVICE === type
                        ? " OMB Services"
                        : " WAF engines"}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(wafEdges, getComparator(order, orderBy)).map((row, index) => {
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
                        {row?.name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.cname}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.ip}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.port}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {formatDate(row?.created_date)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.isActive ? (
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
                            Normal
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
                          onClick={(event) => handleClickMore(event, row?.id, row?.name, row?.isDeleted)}
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
      {WafNodeType.ES_ENGINE === type ? (
        <EsNodeModal open={open} handleClose={handleClose} waf={waf} loading={loading} />
      ) : (
        <WAFModal type={type} open={open} handleClose={handleClose} waf={waf} loading={loading} />
      )}

      {WafNodeType.ES_ENGINE === type ? (
        <ViewEsNodeModal open={viewOpen} handleClose={viewHandleClose} waf={waf} loading={loading} />
      ) : (
        <ViewWAFModal type={type} open={viewOpen} handleClose={viewHandleClose} waf={waf} loading={loading} />
      )}

      <DeleteWAFModal type={type} open={deleteOpen} handleClose={deleteHandleClose} id={wafID} name={wafName} removeFlag={removeFlag} />
      <RestoreWAFModal type={type} open={restoreOpen} handleClose={restoreHandleClose} id={wafID} name={wafName} />
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
        {[UserRole.SUPER_ADMIN].includes(adminRole) && (
          <>
            <MenuItem onClick={editClick} disableRipple>
              <EditIcon />
              Edit
            </MenuItem>
            {WafNodeType.AD_ENGINE !== type &&
              (deleted ? (
                <MenuItem onClick={restoreClick} disableRipple>
                  <RestoreIcon />
                  Restore
                </MenuItem>
              ) : (
                <MenuItem onClick={deleteClick} disableRipple>
                  <DeleteIcon />
                  Delete
                </MenuItem>
              ))}
            {WafNodeType.AD_ENGINE !== type && (
              <>
                <hr />
                <MenuItem onClick={removeClick} disableRipple>
                  <RemoveIcon />
                  Remove
                </MenuItem>
              </>
            )}
          </>
        )}
      </StyledMenu>
    </>
  );
}
function WAFEdgeTable({ type }) {
  return <EnhancedTable type={type} />;
}
export default WAFEdgeTable;
