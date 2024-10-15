import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  // useMediaQuery,
  TableRow,
  TableSortLabel,
  Skeleton,
  IconButton as MuiIconButton,
} from "@mui/material";

import Tooltip from "@mui/material/Tooltip";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import useSite from "../../../../../hooks/user/useSite";
import { formatDate } from "../../../../../utils/format";
import { Paper, TextField } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";
import { MoreVert } from "@mui/icons-material";
import TablePagination from "../../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const EnhancedTableHead = (props) => {
  const headCells = [
    {
      id: "timestamp",
      alignment: "left",
      label: "TimeStamp",
      // mdExist: true,
      // smExist: true,
      // xsExist: true,
    },
    {
      id: "src_ip",
      alignment: "left",
      label: "Source IP",
      // mdExist: true,
      // smExist: true,
      // xsExist: false,
    },
    {
      id: "host_name",
      alignment: "left",
      label: "Hostname",
      // mdExist: true,
      // smExist: true,
      // xsExist: true,
    },
    {
      id: "uri",
      alignment: "left",
      label: "URI",
      // mdExist: true,
      // smExist: false,
      // xsExist: false,
    },
    {
      id: "ua",
      alignment: "left",
      label: "User Agent",
      // mdExist: false,
      // smExist: false,
      // xsExist: false,
    },
    {
      id: "type",
      alignment: "left",
      label: "Type Of Detection",
      // mdExist: true,
      // smExist: false,
      // xsExist: false,
    },
    {
      id: "resStatus",
      alignment: "left",
      label: "Response Status",
      // mdExist: false,
      // smExist: false,
      // xsExist: false,
    },
    {
      id: "method",
      alignment: "left",
      label: "HTTP Method",
      // mdExist: false,
      // smExist: false,
      // xsExist: false,
    },
    {
      id: "view",
      alignment: "left",
      label: "",
      // mdExist: true,
      // smExist: true,
      // xsExist: true,
    },
  ];

  // const theme = useTheme();
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

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
              // border: "0px",
              // display:
              //     !isLG && isMD && !headCell.mdExist
              //         ? "none"
              //         : !isMD && isSM && !headCell.smExist
              //         ? "none"
              //         : !isSM && isSUBSM && !headCell.xsExist
              //         ? "none"
              //         : !isSUBSM && !headCell.xsExist
              //         ? "none"
              //         : "",
            }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "view" ? (
              <Typography variant="textBold">{headCell.label}</Typography>
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <Typography variant="textBold">{headCell.label}</Typography>
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

  var cellArray = [0, 1, 2, 3, 4, 5, 6, 7];
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
          <TableCell></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
SkeletonContent.propTypes = {
  rowsPerPage: PropTypes.number.isRequired,
};
function EnhancedTable({ siteID, timeRange }) {
  const navigate = useNavigate();
  // const theme = useTheme();
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

  const { events, total_events_count, from, rows_per_page, filter, getOnlyEvents } = useSite();

  var totalCount = total_events_count;

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("timestamp");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    setPage(from / rows_per_page);
  }, [from]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setRowsPerPage(rows_per_page);
  }, [rows_per_page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event, id) => {};

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getOnlyEvents(siteID, timeRange, rowsPerPage, rowsPerPage * newPage, filter);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getOnlyEvents(siteID, timeRange, parseInt(event.target.value, 10), 0, filter);
  };

  const gotoDetail = (id) => {
    navigate("/application/analytics/events/" + id);
  };
  return (
    <>
      <Paper id="websiteList" sx={{ boxShadow: "none" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={events?.length} />
            {events === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : events?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={10}>
                    <Typography textAlign="center">There are no events.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(events, getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={`${row?.id}-${index}`} onClick={(event) => handleClick(event, row?.id)}>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !true
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !true
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !true
                          //         ? "none"
                          //         : !isSUBSM && !true
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        {formatDate(row?.timestamp)}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !true
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !true
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        {row?.src_ip}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !true
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !true
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !true
                          //         ? "none"
                          //         : !isSUBSM && !true
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        {row?.host_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !true
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        <Tooltip title={row?.uri} arrow>
                          <Typography>{row?.uri && row?.uri.length > 12 ? row?.uri.substr(0, 12) + " ..." : row?.uri}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !false
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        <Tooltip title={row?.ua} arrow>
                          <Typography>{row?.ua && row?.ua.length > 12 ? row?.ua.substr(0, 12) + " ..." : row?.ua}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !true
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        <Tooltip title={row?.type} arrow>
                          <Typography>{row?.type && row?.type.length > 12 ? row?.type.substr(0, 12) + " ..." : row?.type}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !false
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        {row?.resStatus}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                          // display:
                          //     !isLG && isMD && !false
                          //         ? "none"
                          //         : !isMD &&
                          //           isSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSM &&
                          //           isSUBSM &&
                          //           !false
                          //         ? "none"
                          //         : !isSUBSM && !false
                          //         ? "none"
                          //         : "",
                        }}
                      >
                        {row?.method}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IconButton aria-label="details" size="large" onClick={() => gotoDetail(row?.id)}>
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
    </>
  );
}
function EventList({ siteID, timeRange }) {
  return <EnhancedTable siteID={siteID} timeRange={timeRange} />;
}
export default EventList;