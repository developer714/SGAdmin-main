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
import ViewIcon from "@mui/icons-material/RemoveRedEye";

import usePayment from "../../../../hooks/super/usePayment";
import { formatDate } from "../../../../utils/format";

import { Paper, TextField } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import ViewCustomLicenseStatusModal from "./M_ViewCustomLicenseStatus";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "title",
    alignment: "left",
    label: "Organisation",
  },
  {
    id: "expiry",
    alignment: "left",
    label: "Expiry",
  },
  {
    id: "email",
    alignment: "left",
    label: "Admin Email",
  },
  {
    id: "username",
    alignment: "left",
    label: "Admin Name",
  },
  {
    id: "over_items",
    alignment: "left",
    label: "Over Used Features",
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
            {"action" === headCell.id ? (
              <></>
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
function EnhancedTable() {
  const { licenseStatus4Orgs, licenseTotal, licenseFrom, licenseSize, getLicenseStatus4Orgs } = usePayment();

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [orgID, setOrgID] = React.useState();

  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    setPage(licenseFrom / licenseSize);
  }, [licenseFrom, licenseSize]);
  React.useEffect(() => {
    setRowsPerPage(licenseSize);
  }, [licenseSize]);
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    getLicenseStatus4Orgs(rowsPerPage, rowsPerPage * newPage, false);
  };

  const handleChangeRowsPerPage = async (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
    getLicenseStatus4Orgs(parseInt(event.target.value, 10), 0, false);
  };

  const onViewClick = (org_id) => {
    setOrgID(org_id);
    setOpen(true);
  };

  return (
    <>
      <Paper>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
            {licenseStatus4Orgs === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : licenseStatus4Orgs.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9}>
                    <Typography textAlign="center">There are no license records</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(licenseStatus4Orgs, getComparator(order, orderBy)).map((row, index) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={`${row?.id}-${index}`}>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.title}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.expiry &&
                          (new Date(row?.expiry) > new Date() ? (
                            formatDate(row?.expiry)
                          ) : (
                            <Typography
                              py={1}
                              px={4}
                              sx={{
                                border: "solid 1px #E60000",
                                borderRadius: "20px",
                                width: "fit-content",
                              }}
                            >
                              {formatDate(row?.expiry)}
                            </Typography>
                          ))}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        {row?.email}
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
                        {!row?.over_items ? (
                          row?.over_items
                        ) : (
                          <Typography
                            py={1}
                            px={4}
                            sx={{
                              border: "solid 1px #E60000",
                              borderRadius: "20px",
                              width: "fit-content",
                            }}
                          >
                            {row?.over_items}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          padding: "8px",
                        }}
                      >
                        <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={(e) => onViewClick(row?.id)}>
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
          count={licenseTotal}
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
      <ViewCustomLicenseStatusModal open={open} handleClose={handleClose} orgID={orgID} />
    </>
  );
}
function CustomLicenseStatusList() {
  return <EnhancedTable />;
}
export default CustomLicenseStatusList;
