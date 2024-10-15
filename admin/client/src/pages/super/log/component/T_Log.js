import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import html2canvas from "html2canvas";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
  IconButton as MuiIconButton,
  TextField as MuiTextField,
} from "@mui/material";

import { Download as DownloadIcon } from "react-feather";
import AppsIcon from "@mui/icons-material/Apps";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Search as SearchIcon } from "react-feather";

import useLog from "../../../../hooks/super/useLog";
import { formatDate } from "../../../../utils/format";

import ViewLog from "./M_ViewLog";
import { Paper } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import TablePagination from "../../../../components/common/TablePagination";

const TextField = styled(MuiTextField)`
  width: 100%;
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`;
const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const EnhancedTableHead = (props) => {
  const headCells = [
    {
      id: "date",
      alignment: "left",
      label: "TimeStamp",
    },
    {
      id: "action",
      alignment: "left",
      label: "Action",
    },
    {
      id: "username",
      alignment: "left",
      label: "User",
    },
    {
      id: "organisation",
      alignment: "left",
      label: "Organisation",
    },
    {
      id: "ip_addr",
      alignment: "left",
      label: "IP Address",
    },
  ];

  const { order, orderBy, onRequestSort, onDownload } = props;
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
              <Typography variant="tableHeader">{headCell.label}</Typography>
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          sx={{
            padding: "8px",
          }}
          key={"download"}
          align="left"
        >
          <IconButton size="large" onClick={onDownload}>
            <DownloadIcon />
          </IconButton>
        </TableCell>
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

  var cellArray = [0, 1, 2, 3, 4];
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
  const { logs, getLogs, getLog, total_logs_count, from, size } = useLog();
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("date");
  const [page, setPage] = React.useState(from / size);
  const [rowsPerPage, setRowsPerPage] = React.useState(size);
  const [log, setLog] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const [viewOpen, setViewOpen] = React.useState(false);
  const [actionKeyStr, setActionKeyStr] = React.useState("");
  const [userKeyStr, setUserKeyStr] = React.useState("");
  const [ipAddrKeyStr, setIpAddrKeyStr] = React.useState("");

  const onActionKeyStrChange = (event) => {
    setActionKeyStr(event.target.value);
  };
  const onUserKeyStrChange = (event) => {
    setUserKeyStr(event.target.value);
  };
  const onIpAddrKeyStrChange = (event) => {
    setIpAddrKeyStr(event.target.value);
  };

  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);

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

  const handleClick = (event, id) => {};
  const getConditions = () => {
    const conditions = [];
    if (actionKeyStr) {
      conditions.push({
        key: "action",
        condition: "cont",
        value: actionKeyStr,
      });
    }
    if (userKeyStr) {
      conditions.push({
        key: "username",
        condition: "cont",
        value: userKeyStr,
      });
    }
    if (ipAddrKeyStr) {
      conditions.push({
        key: "ip_addr",
        condition: "cont",
        value: ipAddrKeyStr,
      });
    }
    return conditions;
  };
  const onSearchClick = async (event) => {
    setPage(0);
    getLogs(rowsPerPage, 0, false, getConditions());
  };
  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getLogs(rowsPerPage, rowsPerPage * newPage, false, getConditions());
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    getLogs(parseInt(event.target.value, 10), 0, false, getConditions());
  };
  const viewClick = async (logID) => {
    setLoading(true);
    viewHandleOpen();
    const log = await getLog(logID);
    setLog(log);
    setLoading(false);
  };

  const download = () => {
    var curDate = new Date();
    const input = document.getElementById("auditLogList");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
        unit: "px",
        format: [input.offsetWidth + 240, input.offsetHeight + 180],
      });
      pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
      pdf.save(`SG_AuditLog (` + formatDate(curDate) + `).pdf`);
    });
  };
  return (
    <>
      <Paper id="auditLogList">
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} onDownload={download} />
            {logs === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : (
              <TableBody>
                <TableRow hover tabIndex={-2} key={`audit_conditions`}>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography>Search:</Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <TextField value={actionKeyStr} onChange={onActionKeyStrChange} />
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <TextField value={userKeyStr} onChange={onUserKeyStrChange} />
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  ></TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <TextField value={ipAddrKeyStr} onChange={onIpAddrKeyStrChange} />
                  </TableCell>
                  <TableCell
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <IconButton
                      onClick={onSearchClick}
                      size="large"
                      // sx={{ color: "white" }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {stableSort(logs, getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={`${row?.id}-${index}`} onClick={(event) => handleClick(event, row?.id)}>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {formatDate(row?.date)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.action}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.username}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.organisation}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.ip_addr}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IconButton aria-label="details" size="large" onClick={() => viewClick(row?.id)}>
                          <AppsIcon />
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
          count={total_logs_count}
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
      <ViewLog open={viewOpen} handleClose={viewHandleClose} log={log} loading={loading} />
    </>
  );
}
function LogList() {
  return <EnhancedTable />;
}
export default LogList;
