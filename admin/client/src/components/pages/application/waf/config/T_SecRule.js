import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useLocation, useParams } from "react-router-dom";
import {
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
  // CircularProgress,
  IconButton as MuiIconButton,
  useTheme,
  Stack,
} from "@mui/material";

import { MoreVert } from "@mui/icons-material";

import { CrsSecRuleId, UserRole } from "../../../../../utils/constants";
import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import useAuth from "../../../../../hooks/useAuth";

import ViewCrsSecRuleModal from "./M_ViewCrsSecRule";
import { IOSSwitch, Paper } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";
import { ReactComponent as StatusIcon } from "../../../../../vendor/waf/green_circle.svg";
import TablePagination from "../../../../common/TablePagination";
import { formatDate } from "../../../../../utils/format";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;
// const Root = styled.div`
//     justify-content: center;
//     align-items: center;
//     display: flex;
// `;

const headCells = [
  { id: "sec_rule_id", alignment: "left", label: "Rule ID" },
  { id: "description", alignment: "left", label: "Description" },
  { id: "tags", alignment: "left", label: "Tags" },
  { id: "enabled", alignment: "left", label: "Enable" },
  { id: "action", alignment: "left", label: "More" },
];

const EnhancedTableHead = (props) => {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell role="checkbox" sx={{ padding: "8px" }}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            sx={{ padding: "8px", minWidth: "100px" }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "action" ? (
              <Typography variant="tableHeader">{headCell.label}</Typography>
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

  // const theme = useTheme();
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

  var rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  const cellArray = [1, 2, 3];

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
          <TableCell sx={{ padding: "16px 8px" }} key={"s_" + r + "_4"}></TableCell>
          <TableCell sx={{ padding: "16px 8px" }} key={"s_" + r + "_5"}></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
SkeletonContent.propTypes = { rowsPerPage: PropTypes.number.isRequired };
function EnhancedTable({ disable }) {
  const theme = useTheme();
  const { userRole } = useAuth();

  const { configSite } = useParams();
  const siteUid = configSite;

  const { state } = useLocation();
  const { wafConfig, currule, configCrsSecRule } = useWAFConfig();


  const [rows, setRows] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("custom_rule_id");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows?.map((n) => n.sec_rule_id);
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

  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

  const [secRuleID, setSecRuleID] = React.useState();
  const viewClick = async (id) => {
    setSecRuleID(id);
    viewHandleOpen();
  };

  const srcsecRuleChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    let index = -1;
    for (let i = 0; i < rows?.length; i++) {
      if (rows[i]?.sec_rule_id.toString() === event.target.name) {
        index = i;
        break;
      }
    }
    const value = { enable: !rows[index]?.enabled, rule_id: currule?.rule_id, sec_rule_id: rows[index]?.sec_rule_id };
    const list = [...rows];
    list.splice(index, 1, {
      sec_rule_id: rows[index]?.sec_rule_id,
      enabled: !rows[index]?.enabled,
      description: rows[index]?.description,
      tags: rows[index]?.tags,
    });
    setRows(list);
    if (siteUid) {
      configCrsSecRule(siteUid, value);
    }
  };

  React.useEffect(() => {
    if (currule !== null && currule.length !== 0) {
      setRows(currule?.crs_sec_rules);
    } else if (currule?.length === 0) {
      setRows([]);
    } else {
      setRows(null);
    }
  }, [currule]);

  React.useEffect(() => {
    if (!rows || !rows.length) {
      return;
    }
    if (!(CrsSecRuleId.MIN_OWASP_MODSECURITY <= state?.crs_sec_rule_id)) {
      return;
    }
    const rowIndex = rows.findIndex((row) => parseInt(row.sec_rule_id) === state.crs_sec_rule_id);
    if (0 < rowsPerPage) {
      setPage(Math.floor(rowIndex / rowsPerPage));
    }
  }, [rows, rowsPerPage, state?.crs_sec_rule_id]);

  return (
    <Paper sx={{ maxWidth: "90vw", boxShadow: "none" }}>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows === null ? 0 : rows?.length}
          />
          {rows === null ? (
            <SkeletonContent rowsPerPage={rowsPerPage} />
          ) : rows?.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography textAlign="center">There are no sec rules.</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row?.sec_rule_id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row?.sec_rule_id}-${index}`}
                      selected={isItemSelected}
                    >
                      <TableCell role="checkbox" sx={{ padding: "8px" }}>
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                          onClick={(event) => handleClick(event, row?.sec_rule_id)}
                        />
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {row?.sec_rule_id}
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {row?.description}
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {row?.tags ? (
                          <>
                            {row?.tags.map((tag) => {
                              return (
                                <Typography
                                  sx={{
                                    width: "fit-content",
                                    background: theme.palette.custom.yellow.opacity_80,
                                    padding: "10px",
                                    borderRadius: "10px",
                                    margin: "4px",
                                    float: "left",
                                  }}
                                >
                                  {tag}
                                </Typography>
                              );
                            })}
                          </>
                        ) : (
                          <></>
                        )}
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <IOSSwitch
                          disabled={disable}
                          color="green"
                          checked={row?.enabled}
                          name={row?.sec_rule_id}
                          onChange={srcsecRuleChange}
                        />
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <IconButton aria-label="details" size="large" onClick={() => viewClick(row?.sec_rule_id)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Stack direction="row" alignItems="center" justifyContent="space-between" bgcolor="white" px={4}>
        <Stack direction="row" alignItems="center" bgcolor="white">
          <StatusIcon />
          <Typography ml={2}>Last updated {formatDate(wafConfig?.updated_at)}</Typography>
          {/* <Button variant="text">Refresh</Button> */}
        </Stack>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows === null ? 0 : rows?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Stack>
      <ViewCrsSecRuleModal open={viewOpen} handleClose={viewHandleClose} secRuleID={secRuleID} />
    </Paper>
  );
}
function SecRuleTable({ disable }) {
  return <EnhancedTable disable={disable} />;
}
export default SecRuleTable;
