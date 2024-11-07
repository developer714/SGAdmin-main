import React from "react";
import styled from "@emotion/styled";
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

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";

import useAU from "../../../../hooks/super/useAU";

import { formatDate } from "../../../../utils/format";

import { Paper, TextField } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import TablePagination from "../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "aws_access_key_id",
    alignment: "left",
    label: "AWS_ACCESS_KEY_ID",
  },
  {
    id: "aws_secret_access_key",
    alignment: "left",
    label: "AWS_SECRET_ACCESS_KEY",
  },
  {
    id: "aws_storage_bucket_name",
    alignment: "left",
    label: "AWS_STORAGE_BUCKET_NAME",
  },
  {
    id: "aws_s3_region_name",
    alignment: "left",
    label: "AWS_S3_REGION_NAME",
  },
  {
    id: "updated",
    alignment: "left",
    label: "Update Date",
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
              padding: "16px 8px",
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

  const rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  const cellArray = [1, 2, 3, 4, 5];

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
function EnhancedTable() {
  const { awsS3Cfgs, awsS3CfgTotal, awsS3CfgFrom, awsS3CfgSize, getAwsS3CfgHistory } = useAU();
  var totalCount = awsS3CfgTotal;
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("updated");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    setPage(awsS3CfgFrom / awsS3CfgSize);
  }, [awsS3CfgFrom, awsS3CfgSize]);
  React.useEffect(() => {
    setRowsPerPage(awsS3CfgSize);
  }, [awsS3CfgSize]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getAwsS3CfgHistory(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getAwsS3CfgHistory(parseInt(event.target.value, 10), 0, false);
  };

  return (
    <>
      <Paper>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            {awsS3Cfgs === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : awsS3Cfgs?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">No history found</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(awsS3Cfgs, getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "16px 8px",
                        }}
                      >
                        {row?.aws_access_key_id}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "16px 8px",
                        }}
                      >
                        {row?.aws_secret_access_key}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "16px 8px",
                        }}
                      >
                        {row?.aws_storage_bucket_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "16px 8px",
                        }}
                      >
                        {row?.aws_s3_region_name}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "16px 8px",
                        }}
                      >
                        {row?.updated && formatDate(row?.updated)}
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
function AwsS3CfgHistoryList() {
  return <EnhancedTable />;
}
export default AwsS3CfgHistoryList;
