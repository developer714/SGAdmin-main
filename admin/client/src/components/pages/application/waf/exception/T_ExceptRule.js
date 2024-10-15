import React from "react";
import styled from "@emotion/styled";
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
  IconButton as MuiIconButton,
  useTheme,
} from "@mui/material";

import useAuth from "../../../../../hooks/useAuth";
import { UserRole } from "../../../../../utils/constants";
import { Paper } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";

import { ReactComponent as DeleteIcon } from "../../../../../vendor/button/delete.svg";
import TablePagination from "../../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells1 = [
  {
    id: "sec_rule_id",
    alignment: "left",
    label: "Rule ID",
  },
  {
    id: "description",
    alignment: "left",
    label: "Description",
  },
  {
    id: "tags",
    alignment: "left",
    label: "Tags",
  },
  {
    id: "action",
    alignment: "left",
    label: "",
  },
];
const headCells2 = [
  {
    id: "sec_rule_id",
    alignment: "left",
    label: "Rule ID",
  },
  {
    id: "description",
    alignment: "left",
    label: "Description",
  },
  {
    id: "tags",
    alignment: "left",
    label: "Tags",
  },
];
const EnhancedTableHead = (props) => {
  const { userRole } = useAuth();
  const { onSelectAllClick, onDeleteClick, setSelected, selected, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  let headCells;
  if (UserRole.READONLY_USER === userRole) {
    headCells = headCells2;
  } else {
    headCells = headCells1;
  }

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {UserRole.READONLY_USER === userRole ? (
          <></>
        ) : (
          <TableCell role="checkbox" sx={{ padding: "8px" }}>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all" }}
            />
          </TableCell>
        )}
        {headCells.map((headCell) => (
          <TableCell
            sx={{
              padding: "8px",
              minWidth: "100px",
            }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {"action" === headCell.id ? (
              numSelected ? (
                <IconButton
                  size="large"
                  id="demo-customized-button"
                  aria-haspopup="true"
                  onClick={() => {
                    onDeleteClick(selected);
                    setSelected([]);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
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
function EnhancedTable({ rows, deleteClick }) {
  const theme = useTheme();
  const { userRole } = useAuth();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("sec_rule_id");
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

  return (
    <Paper sx={{ maxWidth: "90vw", boxShadow: "none" }}>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
          <EnhancedTableHead
            numSelected={selected.length}
            onDeleteClick={deleteClick}
            setSelected={setSelected}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            selected={selected}
            rowCount={rows?.length}
          />
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
                    {UserRole.READONLY_USER === userRole ? (
                      <></>
                    ) : (
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
                          onClick={(event) => handleClick(event, row?.sec_rule_id)}
                        />
                      </TableCell>
                    )}
                    <TableCell
                      align="left"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      {row?.sec_rule_id}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      {row?.description}
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{
                        padding: "8px",
                      }}
                    >
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
                    {UserRole.READONLY_USER === userRole ? (
                      <></>
                    ) : (
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {1 > selected.length && (
                          <IconButton size="large" onClick={() => deleteClick([row?.sec_rule_id])}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
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
function ExceptRuleTable({ rows, deleteClick }) {
  return <EnhancedTable rows={rows} deleteClick={deleteClick} />;
}
export default ExceptRuleTable;
