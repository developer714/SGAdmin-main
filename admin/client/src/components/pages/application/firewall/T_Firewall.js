import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
  MenuItem,
  IconButton as MuiIconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  RemoveRedEye as ViewIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";

import { ReactComponent as StatusIcon } from "../../../../vendor/waf/green_circle.svg";

import useFirewall from "../../../../hooks/user/useFirewall";
import useAuth from "../../../../hooks/useAuth";

import DeleteFirewallModal from "./M_DeleteFirewall";
import { formatDate } from "../../../../utils/format";
import { UserRole, FirewallAction, getExpressionKeyTitle } from "../../../../utils/constants";
import { IOSSwitch, Paper, StyledMenu } from "../common/styled";
import TablePagination from "../../../common/TablePagination";
const IconButton = styled(MuiIconButton)`
  padding: 4px;
`;

const headCells = [
  { id: "no", alignment: "left", label: "No" },
  { id: "name", alignment: "left", label: "Name" },
  { id: "action", alignment: "left", label: "Action" },
  { id: "created_at", alignment: "left", label: "Creation Date" },
  { id: "enabled", alignment: "left", label: "Enabled" },
  { id: "order", alignment: "left", label: "Order" },

  { id: "more", alignment: "left", label: "" },
];

const EnhancedTableHead = (props) => {
  const { onSelectAllClick, onDeleteClick, onSaveFwRulesOrderClick, numSelected, rowCount, orderChanged } = props;
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
        {headCells.map((headCell) => (
          <TableCell
            sx={{ padding: "8px" }}
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
          >
            {"more" === headCell.id ? (
              numSelected ? (
                <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={onDeleteClick}>
                  <DeleteIcon />
                </IconButton>
              ) : (
                <Tooltip title="Save Order">
                  <IconButton disabled={!orderChanged} size="large" id="demo-customized-button" onClick={onSaveFwRulesOrderClick}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              <>
                {headCell.icon}
                <Typography variant="tableHeader">{headCell.label}</Typography>
              </>
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
  var cellArray = [1, 2, 3, 4, 5, 6, 7, 8];

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
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();
  const { firewalls, getFirewalls, updateFirewall, setErr, saveFwRulesOrder } = useFirewall();

  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState(null);
  const [orderChanged, setOrderChanged] = React.useState(false);
  const [updatedAt, setUpdatedAt] = React.useState(null);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
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

  const siteUid = configSite;
  const [firewallID, setFirewallID] = React.useState(null);
  const [firewallName, setFirewallName] = React.useState([]);
  const prepareAction = () => {
    if (selected.length > 1) {
      let tmpName = [];
      firewalls.forEach((firewall) => {
        if (selected.indexOf(firewall.id) !== -1) tmpName.push({ id: firewall.id, name: firewall.name });
      });
      setFirewallName(tmpName);
    } else {
      firewalls.forEach((firewall) => {
        if (firewall.id === firewallID) setFirewallName([{ id: firewall.id, name: firewall.name }]);
      });
    }
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event, id) => {
    setAnchorEl(event.currentTarget);
    setFirewallID(id);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };
  const handleClickUpward = (event, idx) => {
    if (0 === idx || rows.length - 1 < idx) return;
    const _rows = [];
    if (1 < idx) {
      rows.slice(0, idx - 1).forEach((_row) => {
        _rows.push(_row);
      });
    }
    _rows.push(rows.at(idx));
    _rows.push(rows.at(idx - 1));
    if (rows.length > idx + 1) {
      rows.slice(idx + 1).forEach((_row) => {
        _rows.push(_row);
      });
    }

    setRows(_rows);
    setOrderChanged(true);
  };
  const handleClickDownward = (event, idx) => {
    if (rows.length - 1 === idx || rows.length - 1 < idx) return;
    const _rows = [];
    if (0 < idx) {
      rows.slice(0, idx).forEach((_row) => {
        _rows.push(_row);
      });
    }
    _rows.push(rows.at(idx + 1));
    _rows.push(rows.at(idx));
    if (rows.length > idx + 2) {
      rows.slice(idx + 2).forEach((_row) => {
        _rows.push(_row);
      });
    }

    setRows(_rows);
    setOrderChanged(true);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getFirewalls(siteUid);
      setOrderChanged(false);
    }
    setErr(null);
  }, [isAuthenticated, siteUid, getFirewalls, setErr]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (firewalls !== null) {
      setRows(firewalls);
    } else {
      setRows(null);
    }

    if (firewalls?.length > 0) {
      setUpdatedAt(new Date(Math.max(...firewalls.map((item) => new Date(item.updated_at)))));
    } else {
      setUpdatedAt(null);
    }

    setOrderChanged(false);
  }, [firewalls]);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  const deleteClick = () => {
    if (UserRole.READONLY_USER === userRole) return;
    prepareAction();
    deleteHandleOpen();
    setAnchorEl(null);
  };
  const editClick = () => {
    // if (UserRole.READONLY_USER === userRole) return;
    navigate(`/application/${siteUid}/firewall/edit/${firewallID}`);
  };
  const changeFirewallEnable = (event, id) => {
    const value = { enabled: !rows[event.target.name].enabled };
    const list = [...rows];
    list[event.target.name]["enabled"] = !rows[event.target.name].enabled;
    setRows(list);
    updateFirewall(siteUid, id, value);
  };
  const onClickSaveFwRulesOrder = async (event) => {
    const value = { fw_rule_ids: rows.map((_row) => _row.id) };
    setErr(null);
    await saveFwRulesOrder(siteUid, value);
    setOrderChanged(false);
  };
  const getAction = (code) => {
    switch (code) {
      case FirewallAction.LOG:
        return "LOG";
      case FirewallAction.BYPASS:
        return "BYPASS";
      case FirewallAction.ALLOW:
        return "ALLOW";
      case FirewallAction.CHALLENGE:
        return "CHALLENGE";
      case FirewallAction.BLOCK:
        return "BLOCK";
      case FirewallAction.DROP:
        return "DROP";
      default:
        break;
    }
  };
  const mustShowRule = (row, pattern) => {
    let showFlag = false;
    if (pattern === undefined || pattern === null || pattern === "") showFlag = true;
    else if ((row?.name ? row?.name : row?.id)?.search(pattern) >= 0) showFlag = true;
    else if (row.fields && row.fields.join().search(pattern) >= 0) showFlag = true;
    else if (getAction(row.action)?.search(pattern) >= 0) showFlag = true;
    else if (row?.created_at && formatDate(row?.created_at)?.search(pattern) >= 0) showFlag = true;
    return showFlag;
  };
  return (
    <div>
      <Paper sx={{ maxWidth: "90vw", boxShadow: "none", borderRadius: "12px" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              onDeleteClick={deleteClick}
              onSaveFwRulesOrderClick={onClickSaveFwRulesOrder}
              rowCount={rows?.length}
              orderChanged={orderChanged}
            />
            {rows === null ? (
              <SkeletonContent rowsPerPage={rowsPerPage} />
            ) : (
              <>
                {rows?.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography textAlign="center">No rules to display.</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                      if (!mustShowRule(row, pattern)) return <></>;

                      const isItemSelected = isSelected(row?.id);
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={`${row?.id}-${index}`}
                          selected={isItemSelected}
                        >
                          <TableCell role="checkbox" sx={{ padding: "8px" }}>
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ "aria-labelledby": labelId }}
                              onClick={(event) => handleClick(event, row?.id)}
                            />
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {index + 1}
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            <Typography>{row?.name ? row?.name : row?.id}</Typography>
                            <Typography color="#aaa">
                              {row?.fields && row?.fields.map((value) => getExpressionKeyTitle(value)).join(", ")}
                            </Typography>
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {getAction(row?.action)}
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {row?.created_at && formatDate(row?.created_at)}
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            <IOSSwitch
                              color="green"
                              checked={row?.enabled}
                              name={index + page * rowsPerPage}
                              onChange={(event) => changeFirewallEnable(event, row?.id)}
                            />
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            <IconButton disabled={0 === index} size="large" onClick={(event) => handleClickUpward(event, index)}>
                              <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton
                              disabled={rows.length - 1 === index}
                              size="large"
                              onClick={(event) => handleClickDownward(event, index)}
                            >
                              <ArrowDownwardIcon />
                            </IconButton>
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {1 > selected.length ? (
                              <IconButton
                                size="large"
                                id="demo-customized-button"
                                aria-controls={openMore ? "demo-customized-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={openMore ? "true" : undefined}
                                onClick={(event) => handleClickMore(event, row?.id)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            ) : (
                              <></>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                )}
              </>
            )}
          </Table>
        </TableContainer>
        <Stack direction="row" alignItems="center" justifyContent="space-between" bgcolor="white" px={4}>
          <Stack direction="row" alignItems="center" bgcolor="white">
            <StatusIcon />
            <Typography ml={2}>Last updated {formatDate(updatedAt)}</Typography>
          </Stack>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows === null || rows === undefined ? 0 : rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Stack>
      </Paper>
      <DeleteFirewallModal
        open={deleteOpen}
        handleClose={deleteHandleClose}
        firewallID={0 < selected.length ? selected : firewallID}
        firewallName={firewallName}
        setSelected={setSelected}
        siteUid={siteUid}
      />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={editClick} disableRipple>
          {UserRole.READONLY_USER === userRole ? <ViewIcon /> : <EditIcon />}
          {UserRole.READONLY_USER === userRole ? "View" : "Edit"}
        </MenuItem>
        {UserRole.READONLY_USER === userRole ? (
          <></>
        ) : (
          <MenuItem onClick={deleteClick} disableRipple>
            <DeleteIcon />
            Delete
          </MenuItem>
        )}
      </StyledMenu>
    </div>
  );
}
function FirewallTable({ pattern }) {
  return <EnhancedTable pattern={pattern} />;
}
export default FirewallTable;
