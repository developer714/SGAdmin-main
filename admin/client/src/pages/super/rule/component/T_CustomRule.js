import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { ReactComponent as StatusLogo } from "../../../../vendor/logo_.svg";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Skeleton,
  MenuItem,
  IconButton as MuiIconButton,
} from "@mui/material";

import {
  Edit as EditIcon,
  // Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  // SettingsBackupRestore as RestoreIcon,
} from "@mui/icons-material";

import { User as UserIcon } from "react-feather";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";

import useRule from "../../../../hooks/super/useRule";

import { CrsRuleNo, CrsSecRuleId } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";

import DeleteCustomRuleModal from "./M_DeleteRule";
import { IOSSwitch, Paper, StyledMenu } from "../../../../components/pages/application/common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";
import { getRuleActionString } from "../../../../components/pages/application/waf/rule/custom/component";
import TablePagination from "../../../../components/common/TablePagination";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  {
    id: "custom_rule_id",
    alignment: "left",
    label: "Rule ID",
  },
  {
    id: "description",
    alignment: "left",
    label: "Description",
  },
  {
    id: "action",
    alignment: "left",
    label: "Action",
  },
  {
    id: "created_date",
    alignment: "left",
    label: "Creation Date",
  },
  {
    id: "custom_rule_id",
    alignment: "left",
    label: "Type",
  },
  // {
  //     id: "isDeleted",
  //     alignment: "left",
  //     label: "Status",
  // },
  {
    id: "enabled",
    alignment: "left",
    label: "Enable",
  },
  {
    id: "_action",
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
  var rowArray = [];
  for (let i = 0; i < rowsPerPage; i++) {
    rowArray.push(i);
  }

  var cellArray = [1, 2, 3, 4, 5, 6];

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
function EnhancedTable({ disabled }) {
  const navigate = useNavigate();

  const { customRules, configCrsSecRule } = useRule();
  const [rows, setRows] = React.useState(null);

  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created_date");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const [ruleID, setRuleID] = React.useState(null);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const [deleted, setDeleted] = React.useState(false);
  const [removeFlag, setRemoveFlag] = React.useState(false);

  React.useEffect(() => {
    setRows(customRules);
  }, [customRules]);

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

  const handleClickMore = (event, id, deleted) => {
    setRuleID(id);
    setAnchorEl(event.currentTarget);
    setDeleted(deleted);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const deleteHandleOpen = () => setOpenDelete(true);
  const deleteHandleClose = () => setOpenDelete(false);

  const editClick = () => {
    setAnchorEl(null);
    navigate(`/super/application/rule/custom/edit/${ruleID}`);
  };
  // const deleteClick = () => {
  //     setAnchorEl(null);
  //     setRemoveFlag(false);
  //     deleteHandleOpen();
  // };
  const removeClick = () => {
    setAnchorEl(null);
    setRemoveFlag(true);
    deleteHandleOpen();
  };
  const customRuleChange = (custom_rule_id, enable) => {
    let index = -1;
    for (let i = 0; i < rows?.length; i++) {
      if (rows[i]?.custom_rule_id === custom_rule_id) {
        index = i;
        break;
      }
    }
    if (-1 < index) {
      const value = {
        enable: enable,
        rule_id: CrsRuleNo.CUSTOM_GLOBAL,
        sec_rule_id: custom_rule_id.toString(),
      };
      const list = [...rows];
      list.splice(index, 1, {
        ...rows[index],
        enabled: enable,
      });
      setRows(list);
      configCrsSecRule(value);
    }
  };

  return (
    <div>
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
                    <Typography textAlign="center">There are no registered custom rules. Please add a new custom rule.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    return (
                      <TableRow hover tabIndex={-1}>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.custom_rule_id}
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
                          {getRuleActionString(row?.action)}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
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
                        {/* <TableCell
                                                    align="left"
                                                    sx={{
                                                        padding: "8px",
                                                    }}
                                                >
                                                    {row?.isDeleted ? (
                                                        <Typography
                                                            py={1}
                                                            px={4}
                                                            sx={{
                                                                backgroundColor:
                                                                    "#E60000",
                                                                borderRadius:
                                                                    "20px",
                                                                color: "white",
                                                                width: "fit-content",
                                                            }}
                                                        >
                                                            Deleted
                                                        </Typography>
                                                    ) : (
                                                        <Typography
                                                            py={1}
                                                            px={4}
                                                            sx={{
                                                                backgroundColor:
                                                                    "#369F33",
                                                                borderRadius:
                                                                    "20px",
                                                                color: "white",
                                                                width: "fit-content",
                                                            }}
                                                        >
                                                            Active
                                                        </Typography>
                                                    )}
                                                </TableCell> */}
                        <TableCell
                          align="left"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <IOSSwitch
                            disabled={disabled}
                            checked={row?.enabled}
                            onChange={(e) => customRuleChange(row?.custom_rule_id, !row?.enabled)}
                          />
                        </TableCell>
                        <TableCell align="left" sx={{ padding: "8px" }}>
                          <IconButton
                            size="large"
                            id="demo-customized-button"
                            aria-controls={openMore ? "demo-customized-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMore ? "true" : undefined}
                            onClick={(event) => handleClickMore(event, row?.custom_rule_id, row?.isDeleted)}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={customRules === null ? 0 : customRules?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <DeleteCustomRuleModal open={openDelete} handleClose={deleteHandleClose} ruleID={ruleID} deleted={deleted} removeFlag={removeFlag} />

      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={editClick} disableRipple>
          <EditIcon />
          Edit
        </MenuItem>
        {/* {deleted ? (
                    <MenuItem onClick={deleteClick} disableRipple>
                        <RestoreIcon />
                        Restore
                    </MenuItem>
                ) : (
                    <MenuItem onClick={deleteClick} disableRipple>
                        <DeleteIcon />
                        Delete
                    </MenuItem>
                )} */}
        <hr />
        <MenuItem onClick={removeClick} disableRipple>
          <RemoveIcon />
          Remove
        </MenuItem>
      </StyledMenu>
    </div>
  );
}
function CustomRuleTable({ disabled }) {
  return <EnhancedTable disabled={disabled} />;
}
export default CustomRuleTable;
