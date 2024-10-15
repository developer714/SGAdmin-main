import React from "react";
import PropTypes from "prop-types";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Skeleton,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from "@mui/material";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";

import { Paper } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";
import TablePagination from "../../../../common/TablePagination";

const headCells = [
  { id: "sec_rule_id", alignment: "left", label: "Rule ID" },
  { id: "description", alignment: "left", label: "Description" },
  { id: "tags", alignment: "left", label: "Tags" },
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
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              <Typography variant="tableHeader">{headCell.label}</Typography>
            </TableSortLabel>
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
  var cellArray = [1, 2, 3, 4];

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
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
function EnhancedTable({ pattern, selected, setSelected }) {
  const theme = useTheme();
  const { rulesForException } = useWAFConfig();
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("sec_rule_id");
  // const [selected, setSelected] = React.useState([]);
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

  React.useEffect(() => {
    if (rulesForException) {
      setPage(0);
      setRows(rulesForException);
    }
  }, [rulesForException]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    var tmpRows = [];
    if (pattern === undefined || pattern === null || pattern === "") {
      setRows(rulesForException);
      return;
    }
    rulesForException.map((row) => {
      var showFlag = false;
      if (row?.sec_rule_id && row?.sec_rule_id.search(pattern) >= 0) showFlag = true;
      if (row?.description && row?.description.search(pattern) >= 0) showFlag = true;
      row?.tags &&
        row?.tags.map((tag) => {
          if (tag.search(pattern) >= 0) showFlag = true;
          return <></>;
        });
      if (showFlag) tmpRows.push(row);
      return <></>;
    });
    setRows(tmpRows);
  }, [pattern]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Paper sx={{ width: "100%", boxShadow: "none" }}>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows?.length}
          />
          {rows === null ? (
            <SkeletonContent rowsPerPage={rowsPerPage} />
          ) : rows?.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={3}>
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
                                    borderRadius: "8px",
                                    margin: "2px 5px",
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
        count={rows?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
function SecRuleTable({ pattern, selected, setSelected }) {
  return <EnhancedTable pattern={pattern} selected={selected} setSelected={setSelected} />;
}
export default SecRuleTable;
