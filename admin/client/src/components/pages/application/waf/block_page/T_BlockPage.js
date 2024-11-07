import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
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
  Stack,
} from "@mui/material";
import { Edit as EditIcon, RemoveRedEye as ViewIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon } from "@mui/icons-material";

import { ReactComponent as StatusIcon } from "../../../../../vendor/waf/green_circle.svg";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import useAuth from "../../../../../hooks/useAuth";

import DeleteBlockPageModal from "./M_DeleteBlockPage";
import EditBlockPageModal from "./M_EditBlockPage";

import { UserRole } from "../../../../../utils/constants";
import { IOSSwitch, Paper, StyledMenu } from "../../common/styled";
import { formatDate } from "../../../../../utils/format";

const IconButton = styled(MuiIconButton)`
  padding: 4px;
`;
const headCells = [
  { id: "no", alignment: "left", label: "No" },
  { id: "name", alignment: "left", label: "Description" },
  { id: "skip_rule_type", alignment: "left", label: "URL" },
  { id: "enabled", alignment: "left", label: "Enabled" },
  { id: "action", alignment: "left", label: "" },
];

const EnhancedTableHead = (props) => {
  const { selectAllPages, deleteBlockPages, numSelected, rowCount } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell role="checkbox" sx={{ padding: "8px" }}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={selectAllPages}
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
            {"action" === headCell.id ? (
              numSelected ? (
                <IconButton size="large" id="demo-customized-button" aria-haspopup="true" onClick={deleteBlockPages}>
                  <DeleteIcon />
                </IconButton>
              ) : (
                <></>
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

function EnhancedTable() {
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();
  const { wafConfig, getWAFConfig, configWafSetting, setErr } = useWAFConfig();

  const [selected, setSelected] = React.useState([]);
  const [rows, setRows] = React.useState(null);
  const [currentKey, setCurrentKey] = React.useState(null);

  const selectAllPages = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const toggleSelection = (event, id) => {
    if (selected.indexOf(id) !== -1) {
      setSelected(selected.filter((selectedId) => id !== selectedId));
    } else {
      setSelected([...selected, id]);
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event, id) => {
    setAnchorEl(event.currentTarget);
    setCurrentKey(id);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getWAFConfig(siteUid);
      }
    }
    setErr(null);
  }, [isAuthenticated, getWAFConfig, siteUid, setErr]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (wafConfig) {
      const tmpRows = Object.keys(wafConfig?.block_page)
        ?.map((key) => {
          return { id: key, description: getLabel(key), ...wafConfig?.block_page[key] };
        })
        .filter((item) => item.url?.length > 0);
      setRows(tmpRows);
    }
  }, [wafConfig]);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);

  const deleteBlockPages = () => {
    if (UserRole.READONLY_USER === userRole) return;
    deleteHandleOpen();
    setAnchorEl(null);
  };

  const [editOpen, setEditOpen] = React.useState(false);
  const editHandleOpen = () => setEditOpen(true);
  const editHandleClose = () => setEditOpen(false);

  const editBlockPage = () => {
    if (UserRole.READONLY_USER === userRole) return;
    editHandleOpen();
    setAnchorEl(null);
  };

  const changePageEnable = (event, id) => {
    const value = {};
    value[id] = { enabled: !rows[event.target.name].enabled };
    const list = [...rows];
    list[event.target.name]["enabled"] = !rows[event.target.name].enabled;
    setRows(list);
    if (siteUid) {
      configWafSetting(siteUid, "set_block_page", value);
    }
  };

  const getLabel = (key) => {
    switch (key) {
      case "waf":
        return "WAF";
      case "location":
        return "Location";
      case "interrupt":
        return "Interruption";
      default:
        return "Unknown";
    }
  };
  return (
    <div>
      <Paper sx={{ maxWidth: "90vw", boxShadow: "none" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected.length}
              selectAllPages={selectAllPages}
              deleteBlockPages={deleteBlockPages}
              rowCount={rows?.length}
            />
            {rows === null ? (
              <SkeletonContent rowsPerPage={3} />
            ) : (
              <>
                {rows?.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography textAlign="center">There are no custom block pages.</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {rows?.map((row, index) => {
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
                              onClick={(event) => toggleSelection(event, row?.id)}
                            />
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {index + 1}
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            <Typography>{row?.description}</Typography>
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            {row?.url}
                          </TableCell>
                          <TableCell align="left" sx={{ padding: "8px" }}>
                            <IOSSwitch
                              color="green"
                              checked={row?.enabled}
                              name={index}
                              onChange={(event) => changePageEnable(event, row?.id)}
                            />
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
        <Stack direction="row" alignItems="center" bgcolor="white" px={4} pt={8}>
          <StatusIcon />
          <Typography ml={2}>Last updated {formatDate(wafConfig?.updated_at)}</Typography>
        </Stack>
      </Paper>
      <DeleteBlockPageModal
        open={deleteOpen}
        handleClose={deleteHandleClose}
        blockPageKeys={0 < selected.length ? selected : [currentKey]}
        setSelected={setSelected}
        siteUid={siteUid}
      />
      <EditBlockPageModal
        open={editOpen}
        handleClose={editHandleClose}
        pageKey={currentKey}
        originalUrl={wafConfig?.block_page?.[currentKey]?.url}
        siteUid={siteUid}
      />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={editBlockPage} disableRipple>
          {UserRole.READONLY_USER === userRole ? <ViewIcon /> : <EditIcon />}
          {UserRole.READONLY_USER === userRole ? "View" : "Edit"}
        </MenuItem>
        {UserRole.READONLY_USER === userRole ? (
          null
        ) : (
          <MenuItem onClick={deleteBlockPages} disableRipple>
            <DeleteIcon />
            Delete
          </MenuItem>
        )}
      </StyledMenu>
    </div>
  );
}
function BlockPageTable() {
  return <EnhancedTable />;
}
export default BlockPageTable;
