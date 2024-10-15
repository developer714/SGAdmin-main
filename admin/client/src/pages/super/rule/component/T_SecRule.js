import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  IconButton as MuiIconButton,
} from "@mui/material";

import { Edit as EditIcon, RemoveRedEye as RemoveRedEyeIcon } from "@mui/icons-material";

import useRule from "../../../../hooks/super/useRule";
import ViewCrsSecRuleModal from "./M_ViewCrsSecRule";
import EditCrsSecRuleModal from "./M_EditCrsSecRule";

import { IOSSwitch, Paper } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import { CrsRuleNo, UserRole } from "../../../../utils/constants";
import useAuth from "../../../../hooks/useAuth";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
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
    id: "enabled",
    alignment: "left",
    label: "Enable",
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
      <TableRow key="owasp_rule_head">
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
  var rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  var cellArray = [1, 2, 3, 4, 5];

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
function EnhancedTable({ disable }) {
  const { currule, configCrsSecRule } = useRule();
  const { adminRole } = useAuth();

  const [rows, setRows] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("sec_rule_id");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);
  const editHandleClose = () => setEditOpen(false);

  const [secRuleID, setSecRuleID] = React.useState();
  const viewClick = async (id) => {
    setSecRuleID(id);
    viewHandleOpen();
  };
  const onEditClick = async (id) => {
    setSecRuleID(id);
    setEditOpen(true);
  };

  const srcsecRuleChange = (event) => {
    let index = -1;
    for (let i = 0; i < rows?.length; i++) {
      if (rows[i]?.sec_rule_id.toString() === event.target.name) {
        index = i;
        break;
      }
    }
    const value = {
      enable: !rows[index]?.enabled,
      rule_id: currule?.rule_id,
      sec_rule_id: rows[index]?.sec_rule_id.toString(),
    };
    const list = [...rows];
    list.splice(index, 1, {
      sec_rule_id: rows[index]?.sec_rule_id,
      enabled: !rows[index]?.enabled,
      description: rows[index]?.description,
      tags: rows[index]?.tags,
    });
    setRows(list);
    configCrsSecRule(value);
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
  return (
    <Paper sx={{ maxWidth: "90vw" }}>
      <TableContainer>
        <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
          <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
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
                  return (
                    <TableRow tabIndex={-1} key={`${row?.sec_rule_id}-${index}`}>
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
                                    background: "#444444",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    margin: "4px",
                                    color: "#FFFFFF",
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
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IOSSwitch
                          disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) || disable}
                          checked={row?.enabled}
                          name={row?.sec_rule_id}
                          onChange={srcsecRuleChange}
                        />
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IconButton
                          aria-label="details"
                          size="large"
                          onClick={() => viewClick(row?.sec_rule_id)}
                          disabled={parseInt(currule?.rule_id) === CrsRuleNo.CUSTOM}
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                        <IconButton
                          aria-label="details"
                          size="large"
                          onClick={() => onEditClick(row?.sec_rule_id)}
                          disabled={
                            ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) ||
                            parseInt(currule?.rule_id) === CrsRuleNo.CUSTOM
                          }
                        >
                          <EditIcon />
                        </IconButton>
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
        count={rows === null ? 0 : rows?.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ViewCrsSecRuleModal open={viewOpen} handleClose={viewHandleClose} secRuleID={secRuleID} />
      <EditCrsSecRuleModal open={editOpen} handleClose={editHandleClose} ruleID={secRuleID} />
    </Paper>
  );
}
function SecRuleTable({ disable }) {
  return <EnhancedTable disable={disable} />;
}
export default SecRuleTable;
