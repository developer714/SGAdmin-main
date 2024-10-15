import React from "react";
import styled from "@emotion/styled";
import $ from "jquery";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";

import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
  IconButton as MuiIconButton,
} from "@mui/material";

import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { RemoveRedEye as ViewIcon } from "@mui/icons-material";

import usePayment from "../../../../hooks/super/usePayment";
import ViewPaymentHistoryModal from "./M_ViewPaymentHistory";
import { formatDate } from "../../../../utils/format";

import { Paper } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "created",
    alignment: "left",
    label: "Payment Date",
  },
  {
    id: "description",
    alignment: "left",
    label: "Description",
  },
  {
    id: "amount",
    alignment: "left",
    label: "Amount",
  },
  {
    id: "canceled_at",
    alignment: "left",
    label: "Canceled Date",
  },
  {
    id: "cancellation_reason",
    alignment: "left",
    label: "Cancellation Reason",
  },
  {
    id: "status",
    alignment: "left",
    label: "Status",
  },
  {
    id: "view",
    alignment: "left",
    label: "View",
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
  const { payHistory, limit } = usePayment();
  const { page, onPageChange } = props;
  let nextDisable = payHistory === null;
  nextDisable = (payHistory === null || payHistory?.length) === 0 || payHistory?.length === undefined || payHistory?.length < limit;

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };
  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  return (
    <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", ml: 4 }}>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={nextDisable} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
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
                padding: "17px 8px",
              }}
              key={"s_" + r + "_" + c}
            >
              <Skeleton
                height="20px"
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
function EnhancedTable({ curOrg }) {
  const { payHistory, limit, getNormalPaymentHistory, getDetailPaymentHistory, reset, setErr } = usePayment();
  var totalCount = 0;

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [before, setBefore] = React.useState(null);
  const [after, setAfter] = React.useState(null);
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    setRowsPerPage(limit);
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (reset) setPage(0);
  }, [reset]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (payHistory === null || payHistory === undefined) return;
    if (payHistory.length === 0) return;
    setAfter(payHistory[payHistory?.length - 1]?.id);
    setBefore(payHistory[0]?.id);
  }, [payHistory]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = async (event, newPage) => {
    if (newPage > page) {
      getNormalPaymentHistory(curOrg, after, null, limit);
    }
    if (newPage < page) {
      getNormalPaymentHistory(curOrg, null, before, limit);
    }
    setPage(newPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getNormalPaymentHistory(curOrg, null, null, parseInt(event.target.value, 10));
  };

  const [loading, setLoading] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const viewHandleOpen = () => setViewOpen(true);
  const viewHandleClose = () => setViewOpen(false);
  const viewMore = async (id) => {
    setErr(null);
    setLoading(true);
    viewHandleOpen();
    setData(await getDetailPaymentHistory(id));
    setLoading(false);
  };

  $(document).ready(function () {
    $(".MuiTablePagination-displayedRows").css("display", "none");
  });
  return (
    <>
      <Paper pt={8}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            {payHistory === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : payHistory?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">No history found</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(payHistory, getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.created && formatDate(new Date(parseInt(row?.created) * 1000))}
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
                        {row?.amount && "$ " + (parseInt(row?.amount) / 100).toString()}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.canceled_at && formatDate(new Date(parseInt(row?.canceled_at) * 1000))}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.cancellation_reason}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.status === "succeeded" ? (
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
                            {row?.status}
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
                            {row?.status}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IconButton size="large" onClick={() => viewMore(row?.id)}>
                          <ViewIcon />
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
      <ViewPaymentHistoryModal open={viewOpen} handleClose={viewHandleClose} loading={loading} data={data} />
    </>
  );
}
function OriginalPaymentHistoryList({ curOrg }) {
  return <EnhancedTable curOrg={curOrg} />;
}
export default OriginalPaymentHistoryList;
