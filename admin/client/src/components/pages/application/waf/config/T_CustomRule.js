import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import CachedIcon from "@mui/icons-material/Cached";
import { ReactComponent as StatusLogo } from "../../../../../vendor/logo_.svg";
// import { useTheme } from "@mui/material/styles";
import {
  Box,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  // useMediaQuery,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  // CircularProgress,
  MenuItem,
  IconButton as MuiIconButton,
  Grid,
  useTheme,
  Button,
  Stack,
} from "@mui/material";

import { Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon, RemoveRedEye as RemoveRedEyeIcon } from "@mui/icons-material";
import { ReactComponent as StatusIcon } from "../../../../../vendor/waf/green_circle.svg";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import useAuth from "../../../../../hooks/useAuth";

import { CrsSecRuleId, UserRole, getRuleKeyTitle } from "../../../../../utils/constants";
import { formatDate } from "../../../../../utils/format";

import DeleteCustomRuleModal from "./M_DeleteRule";

import { Paper, StyledMenu } from "../../common/styled";
import { getComparator, stableSort } from "../../../../../utils/tableSort";
import { getRuleActionString } from "../rule/custom/component";

import { ReactComponent as DownloadIcon } from "../../../../../vendor/button/download.svg";
import { ReactComponent as UserIcon } from "../../../../../vendor/waf/user_outline.svg";
import TablePagination from "../../../../common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;
// const Root = styled.div`
//     justify-content: center;
//     align-items: center;
//     display: flex;
// `;

const headCells = [
  {
    id: "custom_rule_id",
    alignment: "left",
    label: "Rule ID",
    // mdExist: true,
    // smExist: true,
    // xsExist: true,
  },
  {
    id: "description",
    alignment: "left",
    label: "Description",
    // mdExist: true,
    // smExist: true,
    // xsExist: false,
  },
  {
    id: "action",
    alignment: "left",
    label: "Action",
    // mdExist: true,
    // smExist: true,
    // xsExist: false,
  },
  // {
  //     id: "content",
  //     alignment: "left",
  //     label: "Content",
  //     // mdExist: true,
  //     // smExist: false,
  //     // xsExist: false,
  // },
  {
    id: "created_date",
    alignment: "left",
    label: "Creation Date",
    // mdExist: true,
    // smExist: false,
    // xsExist: false,
  },
  {
    id: "custom_rule_id",
    alignment: "left",
    label: "Type",
    // mdExist: true,
    // smExist: false,
    // xsExist: false,
  },
  {
    id: "_action",
    alignment: "left",
    label: "More",
    // mdExist: true,
    // smExist: true,
    // xsExist: true,
  },
];

const EnhancedTableHead = (props) => {
  // const theme = useTheme();
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

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
        {headCells.map((headCell, _index) => (
          <TableCell
            sx={{
              padding: "8px",
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
            key={`${headCell.id}_${_index}`}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === "_action" ? (
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

  // const theme = useTheme();
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

  var rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  var cellArray = [1, 2, 3, 4, 5, 6];

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
          <TableCell />
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
function CustomRuleTable({ refresh, downloadRules }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { userRole } = useAuth();

  // const theme = useTheme();
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  // const isSM = useMediaQuery(theme.breakpoints.up("sm"));
  // const isSUBSM = useMediaQuery(theme.breakpoints.up("subsm"));

  const { wafConfig, customRules } = useWAFConfig();

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("custom_rule_id");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [ruleID, setRuleID] = React.useState(null);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = customRules?.map((n) => n.custom_rule_id);
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

  const handleClickMore = (event, id) => {
    setRuleID(id);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const deleteHandleOpen = () => setOpenDelete(true);
  const deleteHandleClose = () => setOpenDelete(false);

  const editClick = () => {
    setAnchorEl(null);
    navigate(`/application/waf/rule/custom/edit/${ruleID}`);
  };
  const deleteClick = () => {
    setAnchorEl(null);
    deleteHandleOpen();
  };

  // let strLen = { md: 40, xs: 20 };

  return (
    <div>
      <Grid
        container
        sx={{
          display: "flex",
          alignItems: "center",
          marginTop: "24px",
          height: "50px",
          background: theme.palette.custom.yellow.opacity_50,
        }}
      >
        <Grid item>
          <Typography variant="textMedium" sx={{ padding: "16px" }}>
            {selected.length} rows selected.
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item alignItems="right" display="flex">
          <Button variant="text" color="primary" startIcon={<CachedIcon />} onClick={refresh}>
            Refresh
          </Button>
          <Button variant="text" color="primary" startIcon={<DownloadIcon />} onClick={downloadRules}>
            Download
          </Button>
        </Grid>
      </Grid>
      <Paper sx={{ maxWidth: "90vw", boxShadow: "none" }} mt={2}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={customRules === null ? 0 : customRules?.length}
            />
            {customRules === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : customRules?.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography textAlign="center">There are no registered custom rules. Please add a new custom rule.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(customRules, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row?.custom_rule_id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    const row_key = `${row?.custom_rule_id}-${index}`;

                    return (
                      <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row_key} selected={isItemSelected}>
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
                            onClick={(event) => handleClick(event, row?.custom_rule_id)}
                          />
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                            // display:
                            //     !isLG &&
                            //     isMD &&
                            //     !true
                            //         ? "none"
                            //         : !isMD &&
                            //           isSM &&
                            //           !true
                            //         ? "none"
                            //         : !isSM &&
                            //           isSUBSM &&
                            //           !true
                            //         ? "none"
                            //         : !isSUBSM &&
                            //           !true
                            //         ? "none"
                            //         : "",
                          }}
                        >
                          {row?.custom_rule_id}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                            // display:
                            //     !isLG &&
                            //     isMD &&
                            //     !true
                            //         ? "none"
                            //         : !isMD &&
                            //           isSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSM &&
                            //           isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : "",
                          }}
                        >
                          {row?.description}
                          <Typography color="#aaa">
                            {[...new Set(row.conditions?.reduce((allConditions, condition) => allConditions.concat(condition.key), []))]
                              .map((condition) => getRuleKeyTitle(condition))
                              .join(", ")}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                            // display:
                            //     !isLG &&
                            //     isMD &&
                            //     !true
                            //         ? "none"
                            //         : !isMD &&
                            //           isSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSM &&
                            //           isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : "",
                          }}
                        >
                          {getRuleActionString(row?.action)}
                        </TableCell>
                        {/* <TableCell
                                                    align="left"
                                                    sx={{
                                                        padding: "8px",
                                                        // display:
                                                        //     !isLG &&
                                                        //     isMD &&
                                                        //     !true
                                                        //         ? "none"
                                                        //         : !isMD &&
                                                        //           isSM &&
                                                        //           !true
                                                        //         ? "none"
                                                        //         : !isSM &&
                                                        //           isSUBSM &&
                                                        //           !false
                                                        //         ? "none"
                                                        //         : !isSUBSM &&
                                                        //           !false
                                                        //         ? "none"
                                                        //         : "",
                                                    }}
                                                >
                                                    {row?.content.length > strLen
                                                        ? row?.content.substr(
                                                              0,
                                                              strLen
                                                          ) + " ..."
                                                        : row?.content}
                                                </TableCell> */}

                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                            // display:
                            //     !isLG &&
                            //     isMD &&
                            //     !true
                            //         ? "none"
                            //         : !isMD &&
                            //           isSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSM &&
                            //           isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : !isSUBSM &&
                            //           !false
                            //         ? "none"
                            //         : "",
                          }}
                        >
                          {row?.created_date && formatDate(row?.created_date)}
                        </TableCell>
                        <TableCell align="left">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {CrsSecRuleId.MIN_CUSTOM_GLOBAL <= row?.custom_rule_id ? (
                              <>
                                <StatusLogo widht="24px" height="24px" fill="#369F33" />
                                <Typography pl={2}>Sense Defence Managed</Typography>
                              </>
                            ) : (
                              <>
                                <UserIcon color="#369F33" />
                                <Typography pl={2}>User Managed</Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          <IconButton
                            size="large"
                            id="demo-customized-button"
                            aria-controls={openMore ? "demo-customized-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMore ? "true" : undefined}
                            onClick={(event) => handleClickMore(event, row?.custom_rule_id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <Stack direction="row" alignItems="center" justifyContent="space-between" bgcolor="white" px={4}>
          <Stack direction="row" alignItems="center" bgcolor="white">
            <StatusIcon />
            <Typography ml={2}>Last updated {formatDate(wafConfig?.updated_at)}</Typography>
          </Stack>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={customRules === null ? 0 : customRules?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Stack>
      </Paper>
      <DeleteCustomRuleModal open={openDelete} handleClose={deleteHandleClose} ruleID={ruleID} />

      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        {UserRole.READONLY_USER === userRole || CrsSecRuleId.MIN_CUSTOM_GLOBAL <= ruleID ? (
          <MenuItem onClick={editClick} disableRipple>
            <RemoveRedEyeIcon />
            View
          </MenuItem>
        ) : (
          [
            <MenuItem onClick={editClick} disableRipple key={0}>
              <EditIcon />
              Edit
            </MenuItem>,
            <MenuItem onClick={deleteClick} disableRipple key={1}>
              <DeleteIcon />
              Delete
            </MenuItem>
          ]
        )}
      </StyledMenu>
    </div>
  );
}

CustomRuleTable.propTypes = {
  refresh: PropTypes.func.isRequired,
  // downloadRules: PropTypes.func.isRequired,
};

export default CustomRuleTable;
