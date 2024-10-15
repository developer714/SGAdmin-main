import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from "@mui/material";
import { WafType, SeverityName, SeverityLevel } from "../../../../utils/constants";

import { Paper } from "../common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";

const headCells = [
  {
    id: "waf_type",
    alignment: "left",
    label: "WAF Type",
  },
  {
    id: "sec_rule_id",
    alignment: "left",
    label: "Rule ID",
  },
  {
    id: "attack_type",
    alignment: "left",
    label: "Attack Type",
  },
  {
    id: "paranoia_level",
    alignment: "left",
    label: "Paranoia Level",
  },
  {
    id: "severity",
    alignment: "left",
    label: "Severity",
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
              padding: "12px",
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
              <Typography variant="tableHeader">{headCell.label}</Typography>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
const getType = (type) => {
  switch (type) {
    case WafType.MLFWAF:
      return "Machine Learning";
    case WafType.SIGNATURE:
      return "OWASP Signature";
    case WafType.SENSEDEFENCE_SIGNATURE:
      return "Sense Defence Signature";
    case WafType.FIREWALL:
      return "Firewall";
    default:
      return "Signature";
  }
};
function getSeverityName(nLevel) {
  switch (nLevel) {
    case SeverityLevel.INFO:
      return SeverityName.INFO;
    case SeverityLevel.NOTICE:
      return SeverityName.NOTICE;
    case SeverityLevel.WARNING:
      return SeverityName.WARNING;
    case SeverityLevel.ERROR:
      return SeverityName.ERROR;
    case SeverityLevel.CRITICAL:
      return SeverityName.CRITICAL;
    default:
      return SeverityName.UNKNOWN;
  }
}
function EnhancedTable({ type, event }) {
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created_date");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <div>
      <Paper sx={{ maxWidth: "90vw", boxShadow: "none" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={event?.length} />
            {event?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography textAlign="center">No Detection Type</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(event, getComparator(order, orderBy)).map((row, index) => {
                  return row?.waf_type !== type ? (
                    <></>
                  ) : (
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "12px",
                          border: "0px",
                        }}
                      >
                        {getType(row?.waf_type)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "12px",
                          border: "0px",
                        }}
                      >
                        {row?.sec_rule_id ? row?.sec_rule_id : "-"}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "12px",
                          border: "0px",
                        }}
                      >
                        {row?.attack_type ? row?.attack_type : "-"}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "12px",
                          border: "0px",
                        }}
                      >
                        {row?.paranoia_level ? row?.paranoia_level : "-"}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "12px",
                          border: "0px",
                        }}
                      >
                        {row?.severity ? getSeverityName(row?.severity) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}
function DetectionTypeTable({ event, type }) {
  return <EnhancedTable event={event} type={type} />;
}
export default DetectionTypeTable;
