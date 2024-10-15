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
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";

import DeleteRegionModal from "./M_DeleteRegion";
import RestoreRegionModal from "./M_RestoreRegion";
import ViewRegionModal from "./M_ViewRegion";
import TestRegionModal from "./M_TestRegion";
import RegionModal from "./M_Region";

import useRegion from "../../../../hooks/super/useRegion";
import { formatDate } from "../../../../utils/format";
import { UserRole } from "../../../../utils/constants";

import { Paper, StyledMenu, TextField } from "../../application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import useAuth from "../../../../hooks/useAuth";
import TablePagination from "../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "name",
    alignment: "left",
    label: "Region",
  },
  {
    id: "host_name",
    alignment: "left",
    label: "Host Name",
  },
  {
    id: "edge_ip",
    alignment: "left",
    label: "Edge Private IP Address",
  },
  {
    id: "res_code",
    alignment: "left",
    label: "Response Code",
  },
  {
    id: "created_at",
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
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
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
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.icon}
              <Typography variant="tableHeader">{headCell.label}</Typography>
            </TableSortLabel>
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
  const { regions, total, from, size, getRegions, viewRegion } = useRegion();
  const { adminRole } = useAuth();
  var totalCount = total;
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("isActive");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    setPage(from / size);
  }, [from, size]);
  React.useEffect(() => {
    setRowsPerPage(size);
  }, [size]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const [loading, setLoading] = React.useState(false);
  const [regionID, setRegionID] = React.useState();
  const [wafName, setWafName] = React.useState();
  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);
  const [region, setRegion] = React.useState();

  const handleClickMore = (event, id, name, deleted) => {
    setAnchorEl(event.currentTarget);
    setRegionID(id);
    setWafName(name);
    setDeleted(deleted);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getRegions(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getRegions(parseInt(event.target.value, 10), 0, false);
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

  const [testOpen, setTestOpen] = React.useState(false);
  const testHandleOpen = () => setTestOpen(true);
  const testHandleClose = () => setTestOpen(false);

  const viewClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    setRegion(await viewRegion(regionID));
    viewHandleOpen();
    setLoading(false);
  };
  const editClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    setRegion(await viewRegion(regionID));
    handleOpen();
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
  const testClick = async () => {
    setLoading(true);
    setAnchorEl(null);
    setRegion(await viewRegion(regionID));
    testHandleOpen();
    setLoading(false);
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
              // onDeleteClick={deleteClick}
              // onRestoreClick={restoreClick}
              // rowCount={totalCount}
            />
            {regions === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : regions.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no regions</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(regions, getComparator(order, orderBy)).map((row, index) => {
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
                        {row?.host_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.edge_ip}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.res_code}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {formatDate(row?.created_at)}
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
      <RegionModal open={open} handleClose={handleClose} region={region} loading={loading} />
      <ViewRegionModal open={viewOpen} handleClose={viewHandleClose} region={region} loading={loading} />
      <DeleteRegionModal open={deleteOpen} handleClose={deleteHandleClose} id={regionID} name={wafName} removeFlag={removeFlag} />
      <RestoreRegionModal open={restoreOpen} handleClose={restoreHandleClose} id={regionID} name={wafName} />
      <TestRegionModal open={testOpen} handleClose={testHandleClose} region={region} loading={loading} />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        {(() => {
          const menu_items = [
            <MenuItem onClick={viewClick} disableRipple>
              <RemoveRedEyeIcon />
              View
            </MenuItem>,
            <MenuItem onClick={testClick} disableRipple>
              <TroubleshootIcon />
              Test
            </MenuItem>,
          ];
          if ([UserRole.SUPER_ADMIN].includes(adminRole)) {
            menu_items.push(
              <MenuItem onClick={editClick} disableRipple>
                <EditIcon />
                Edit
              </MenuItem>
            );
            if (deleted) {
              menu_items.push(
                <MenuItem onClick={restoreClick} disableRipple>
                  <RestoreIcon />
                  Restore
                </MenuItem>
              );
            } else {
              menu_items.push(
                <MenuItem onClick={deleteClick} disableRipple>
                  <DeleteIcon />
                  Delete
                </MenuItem>
              );
            }
            menu_items.push(<hr />);
            menu_items.push(
              <MenuItem onClick={removeClick} disableRipple>
                <RemoveIcon />
                Remove
              </MenuItem>
            );
          }
          return menu_items;
        })()}
      </StyledMenu>
    </>
  );
}
function RegionTable() {
  return <EnhancedTable />;
}
export default RegionTable;
