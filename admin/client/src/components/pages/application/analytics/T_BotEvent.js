import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import {
  Box,
  Chip,
  IconButton as MuiIconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  // useMediaQuery,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";

import Tooltip from "@mui/material/Tooltip";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { MoreVert } from "@mui/icons-material";
import ReactCountryFlag from "react-country-flag";

import useEvent from "../../../../hooks/user/useEvent";
// import useAuth from "../../../../hooks/useAuth";
import { formatDate } from "../../../../utils/format";

import { Paper, TextField } from "../common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import { getBotType } from "./common";
// import { BotScore } from "../../../../utils/constants";
import TablePagination from "../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const EnhancedTableHead = (props) => {
  const theme = useTheme();
  const headCells = [
    { id: "host_name", alignment: "left", label: "Hostname" },
    { id: "resStatus", alignment: "left", label: "Activity" },
    { id: "src_ip", alignment: "left", label: "Source IP" },
    { id: "bot_score", alignment: "left", label: "Bot Type" },
    /*
        {            id: "uri",
            alignment: "left",
            label: "URI",
        },
        {            id: "ua",
            alignment: "left",
            label: "User Agent",
        },
        {            id: "ja3_hash",
            alignment: "left",
            label: "JA3 Fingerprint",
        },
        {            id: "method",
            alignment: "left",
            label: "HTTP Method",
        },
        */
    { id: "timestamp", alignment: "left", label: "TimeStamp" },
    { id: "view", alignment: "left", label: "" },
  ];

  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ background: theme.palette.custom.blue.main }}>
        {headCells.map((headCell) => (
          <TableCell
            sx={{ padding: "21px 16px" }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "view" ? (
              <Typography variant="text" color="white">
                {headCell.label}
              </Typography>
            ) : (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                <Typography variant="text" color="white">
                  {headCell.label}
                </Typography>
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
        InputProps={{ inputProps: { style: { textAlign: "center" } } }}
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

  var cellArray = [0, 1, 2, 3, 4, 5];

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
function EnhancedTable({ pattern }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { botEvents, site_id, time_range, total_bot_events_count, from, rows_per_page, action, conditions, getOnlyBotEvents } = useEvent();

  var totalCount = total_bot_events_count;

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("timestamp");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  React.useEffect(() => {
    setPage(from / rows_per_page);
  }, [from, rows_per_page]);
  React.useEffect(() => {
    setRowsPerPage(rows_per_page);
  }, [rows_per_page]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event, id) => {};

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getOnlyBotEvents(site_id, time_range, rowsPerPage, rowsPerPage * newPage, action, conditions);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));

    getOnlyBotEvents(site_id, time_range, parseInt(event.target.value, 10), 0, action, conditions);
  };

  const gotoDetail = (id) => {
    navigate("/application/analytics/bot_events/" + id);
  };

  return (
    <>
      <Paper id="websiteList" mt={5} sx={{ boxShadow: "none" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} rowCount={totalCount} />
            {botEvents === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : botEvents.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no bot events</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(botEvents, getComparator(order, orderBy)).map((row, index) => {
                  var showFlag = false;
                  if (pattern === undefined || pattern === null || pattern === "") showFlag = true;
                  if (formatDate(row?.timestamp).search(pattern) > 0) showFlag = true;
                  if (row?.src_ip?.search(pattern) >= 0) showFlag = true;
                  if (row?.host_name?.search(pattern) >= 0) showFlag = true;
                  if (row?.uri?.search(pattern) >= 0) showFlag = true;
                  if (row?.ua?.search(pattern) >= 0) showFlag = true;
                  if (row?.resStatus.toString().search(pattern) >= 0) showFlag = true;
                  if (row?.ja3_hash?.search(pattern) >= 0) showFlag = true;
                  if (getBotType(row?.bot_score).toString().search(pattern) >= 0) showFlag = true;
                  if (row?.method?.search(pattern) >= 0) showFlag = true;
                  if (!showFlag) return <></>;
                  return (
                    <TableRow hover tabIndex={-1} key={`${row?.id}-${index}`} onClick={(event) => handleClick(event, row?.id)}>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {row?.host_name}
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <Box>
                          <Typography>
                            {row?.resStatus} {row?.method}
                          </Typography>
                          {row?.uri?.length > 24 ? (
                            <Tooltip title={row?.uri} arrow>
                              <Typography variant="textSmall" sx={{ color: theme.palette.custom.green.main }}>
                                {row?.uri.substr(0, 24) + " ..."}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography variant="textSmall" sx={{ color: theme.palette.custom.green.main }}>
                              {row?.uri}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <Box display="flex" alignItems={"center"}>
                          <ReactCountryFlag countryCode={row?.country_iso_code} svg title={row?.country_name} />
                          <Typography pl={2}>{row?.src_ip}</Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <Chip
                          label={getBotType(row?.bot_score)}
                          sx={{ m: "2px 5px", background: theme.palette.custom.yellow.opacity_80, borderRadius: "10px" }}
                        />
                      </TableCell>
                      {/* <TableCell align="left" sx={{ padding: "8px" }}>
                        <Tooltip title={row?.uri} arrow>
                          <Typography>{row?.uri && row?.uri.length > 12 ? row?.uri.substr(0, 12) + " ..." : row?.uri}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <Tooltip title={row?.ua} arrow>
                          <Typography>{row?.ua && row?.ua.length > 12 ? row?.ua.substr(0, 12) + " ..." : row?.ua}</Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        <Tooltip title={row?.ja3_hash} arrow>
                          <Typography>
                            {row?.ja3_hash && row?.ja3_hash.length > 12 ? row?.ja3_hash.substr(0, 12) + " ..." : row?.ja3_hash}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
                        {row?.method}
                      </TableCell> */}
                      <TableCell align="left" sx={{ padding: "8px", minWidth: "200px" }}>
                        {formatDate(row?.timestamp)}
                      </TableCell>
                      <TableCell align="left" sx={{ padding: "8px" }}>
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
          SelectProps={{ inputProps: { "aria-label": "rows per page" }, native: true }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </Paper>
    </>
  );
}
function BotEventList({ pattern }) {
  return <EnhancedTable pattern={pattern} />;
}
export default BotEventList;
