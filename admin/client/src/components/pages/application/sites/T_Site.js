import React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Checkbox,
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
  Box,
  Grid,
  useTheme,
} from "@mui/material";

import {
  Dashboard as DashboardIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingIcon,
  ArrowCircleUp as CircleUpIcon,
  ArrowCircleDown as CircleDownIcon,
} from "@mui/icons-material";

// import { Download as DownloadIcon } from "react-feather";
import CachedIcon from "@mui/icons-material/Cached";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import DeleteLogIcon from "@mui/icons-material/PlaylistRemoveOutlined";
import RemoveIcon from "@mui/icons-material/RemoveCircleOutline";

import useSite from "../../../../hooks/user/useSite";
import useAuth from "../../../../hooks/useAuth";
import { formatDate } from "../../../../utils/format";
import DeleteSiteModal from "./M_DeleteSite";
import DeleteLogModal from "./M_DeleteLog";

import SiteModal from "./M_Site";

import { ReactComponent as Origin } from "../../../../vendor/website/origin.svg";
import { ReactComponent as Website } from "../../../../vendor/website/website.svg";
import { ReactComponent as Calendar } from "../../../../vendor/website/calendar.svg";
import { ReactComponent as Check } from "../../../../vendor/website/check.svg";
import { ReactComponent as Detection } from "../../../../vendor/website/detection.svg";
import { ReactComponent as DownloadIcon } from "../../../../vendor/button/download.svg";

import { WafStatus, UserRole } from "../../../../utils/constants";

import { Button, Paper, SnackbarAlert, StyledMenu } from "../common/styled";
import { getComparator, stableSort } from "../../../../utils/tableSort";

const IconButton = styled(MuiIconButton)`
  padding: 8px;
`;

const headCells = [
  { id: "site_id", alignment: "left", icon: <Website />, label: "Domain Name" },
  { id: "addr", alignment: "left", icon: <Origin />, label: "Origin" },
  { id: "waf_detections", alignment: "left", icon: <Detection />, label: "Detections" },
  { id: "created_date", alignment: "left", icon: <Calendar />, label: "OnBoarded" },
  { id: "status", alignment: "left", icon: <Check />, label: "WAF" },
  { id: "isDeleted", alignment: "left", icon: <Check />, label: "Status" },
  { id: "action", alignment: "left", label: "" },
];

const EnhancedTableHead = (props) => {
  const { userRole, sauser } = useAuth();
  const { onSelectAllClick, onDeleteClick, onRestoreClick, unDeletedSites, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  return (
    <TableHead>
      <TableRow>
        {UserRole.READONLY_USER === userRole ? (
          <></>
        ) : (
          <TableCell role="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all" }}
              disabled={unDeletedSites === null}
            />
          </TableCell>
        )}

        {headCells.map((headCell) => {
          if (!sauser && headCell.id === "isDeleted") return <></>;
          return (
            <TableCell
              key={headCell.id}
              align={headCell.alignment}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {"action" === headCell.id ? (
                numSelected && sauser ? (
                  <>
                    <IconButton size="large" aria-haspopup="true" onClick={onDeleteClick}>
                      <DeleteIcon />
                    </IconButton>
                    <IconButton size="large" aria-haspopup="true" onClick={onRestoreClick}>
                      <RestoreIcon />
                    </IconButton>
                  </>
                ) : numSelected && !sauser ? (
                  <IconButton size="large" aria-haspopup="true" onClick={onDeleteClick}>
                    <DeleteIcon />
                  </IconButton>
                ) : (
                  <></>
                )
              ) : (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                </TableSortLabel>
              )}
            </TableCell>
          );
        })}
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
  var cellArray = [];
  const { userRole, sauser } = useAuth();
  if (sauser) {
    cellArray = [1, 2, 3, 4, 5, 6];
  } else if (UserRole.READONLY_USER === userRole) {
    cellArray = [1, 2, 3, 4];
  } else {
    cellArray = [1, 2, 3, 4, 5];
  }

  return (
    <TableBody>
      {rowArray.map((r) => (
        <TableRow key={"s_" + r}>
          <TableCell sx={{ padding: "16px 8px" }} key={"s_" + r + "_0"}></TableCell>
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
function SiteTable({ pattern, refresh, downloadWebsites }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { userRole, sauser } = useAuth();
  const { sites, site_List, viewSite } = useSite();
  const [unDeletedSites, setUnDeletedSites] = React.useState(null);
  const [deleted, setDeleted] = React.useState(false);
  const [deleteFlag, setDeleteFlag] = React.useState(true);
  const [removeFlag, setRemoveFlag] = React.useState(false);

  React.useEffect(() => {
    if (sites === null || sites === undefined) {
      if (site_List === null || site_List === undefined) {
        setUnDeletedSites(null);
      } else if (sauser) {
        setUnDeletedSites(site_List);
      } else {
        setUnDeletedSites(site_List?.filter((s) => !s.isDeleted));
      }
    } else if (sauser) {
      setUnDeletedSites(sites);
    } else {
      setUnDeletedSites(sites?.filter((s) => !s.isDeleted));
    }
  }, [sites, sauser, site_List]);
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("created_date");
  const [selected, setSelected] = React.useState([]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = unDeletedSites?.map((n) => n.site_id);
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

  const isSelected = (id) => selected?.indexOf(id) !== -1;

  const [siteID, setSiteID] = React.useState();
  const [siteUid, setSiteUid] = React.useState();
  const [site, setSite] = React.useState(null);
  const [expandedSites, setExpandedSites] = React.useState([]);

  React.useEffect(() => {
    if (sites === null) setSelected([]);
  }, [sites]); // eslint-disable-line react-hooks/exhaustive-deps
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (event, uid, id, deleted) => {
    setSiteUid(uid);
    setSiteID(id);
    setAnchorEl(event.currentTarget);
    setDeleted(deleted);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const deleteHandleOpen = () => setDeleteOpen(true);
  const deleteHandleClose = () => setDeleteOpen(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSite(null);
  };
  const [logOpen, setLogOpen] = React.useState(false);
  const logHandleOpen = () => setLogOpen(true);
  const logHandleClose = () => setLogOpen(false);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const dashboardClick = () => {
    setAnchorEl(null);
    navigate(`/application/${siteUid}/waf/dashboard`);
  };
  const configurationClick = () => {
    setAnchorEl(null);
    navigate(`/application/${siteUid}/waf/config`);
  };
  const deleteClick = () => {
    setAnchorEl(null);
    setRemoveFlag(false);
    setDeleteFlag(true);
    deleteHandleOpen();
  };
  const removeClick = () => {
    setAnchorEl(null);
    setRemoveFlag(true);
    setDeleteFlag(true);
    deleteHandleOpen();
  };
  const restoreClick = () => {
    setAnchorEl(null);
    setDeleteFlag(false);
    deleteHandleOpen();
  };
  const editClick = async () => {
    setAnchorEl(null);
    handleOpen();
    const _site = await viewSite(siteUid);
    setSite(_site);
  };
  const deleteLogClick = () => {
    setAnchorEl(null);
    logHandleOpen();
  };

  const getStatusString = (status) => {
    if (status === null || status === undefined) return null;
    switch (status) {
      case WafStatus.UNHEALTHY:
        return "Unhealthy";
      case WafStatus.DISABLED:
        return "Disabled";
      case WafStatus.DETECT:
        return "Detection";
      default:
        return "Enforced";
    }
  };
  return (
    <>
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
          <Button variant="text" color="primary" startIcon={<DownloadIcon />} onClick={downloadWebsites}>
            Download
          </Button>
        </Grid>
      </Grid>
      <Paper sx={{ maxWidth: "90vw", marginTop: "8px" }}>
        <TableContainer>
          <Table aria-labelledby="tableTitle" size={"medium"} aria-label="enhanced table">
            <EnhancedTableHead
              numSelected={selected?.length}
              selected={selected}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              onDeleteClick={deleteClick}
              onRestoreClick={restoreClick}
              unDeletedSites={unDeletedSites}
              rowCount={unDeletedSites?.length}
            />
            {!unDeletedSites ? (
              <SkeletonContent rowsPerPage={5} />
            ) : !unDeletedSites?.length ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography textAlign="center">There are no registered sites. Please add a new site.</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {stableSort(unDeletedSites, getComparator(order, orderBy)).map((row, index) => {
                  const isItemSelected = isSelected(row?.site_id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  if (row?.site_id.search(pattern) < 0) return <></>;
                  const retRows = [
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row?.site_id}-${index}`}
                      selected={isItemSelected}
                    >
                      {UserRole.READONLY_USER === userRole ? (
                        <></>
                      ) : (
                        <TableCell role="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(event) => handleClick(event, row?.site_id)}
                          />
                        </TableCell>
                      )}

                      <TableCell align="left">
                        {row?.site_id}
                        <IconButton
                          onClick={() => {
                            if (!!expandedSites.find((item) => item === row?.id)) {
                              setExpandedSites(expandedSites.filter((item) => item !== row?.id));
                            } else {
                              setExpandedSites([row?.id].concat(expandedSites));
                            }
                          }}
                        >
                          {expandedSites.findIndex((item) => item === row?.id) ? <CircleDownIcon /> : <CircleUpIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell align="left">{row?.addr}</TableCell>
                      <TableCell align="left">
                        {row?.waf_detections ?? (
                          <Skeleton height="22px" width="100%" py="5px" variant="rectangular" sx={{ borderRadius: "11px" }} />
                        )}
                      </TableCell>
                      <TableCell align="left">{formatDate(row?.created_date)}</TableCell>
                      <TableCell align="left">
                        {getStatusString(row?.status) ?? (
                          <Skeleton height="22px" width="100%" py="5px" variant="rectangular" sx={{ borderRadius: "11px" }} />
                        )}
                      </TableCell>
                      {sauser && (
                        <TableCell align="left">
                          {row?.isDeleted ? (
                            <Typography
                              py={1}
                              px={4}
                              sx={{ backgroundColor: "#E60000", borderRadius: "20px", color: "white", width: "fit-content" }}
                            >
                              Deleted
                            </Typography>
                          ) : (
                            <Typography
                              py={1}
                              px={4}
                              sx={{ backgroundColor: "#369F33", borderRadius: "20px", color: "white", width: "fit-content" }}
                            >
                              Active
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell align="left">
                        {1 > selected.length && (
                          <IconButton
                            size="large"
                            id="demo-customized-button"
                            aria-controls={openMore ? "demo-customized-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={openMore ? "true" : undefined}
                            onClick={(event) => handleClickMore(event, row?.id, row?.site_id, row?.isDeleted)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>,
                  ];
                  if (expandedSites.find((item) => item === row?.id)) {
                    row?.subdomains?.forEach((subdomain, subIdx) => {
                      retRows.push(
                        <TableRow
                          hover
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={`${row?.site_id}-${index}-${subIdx}`}
                          selected={isItemSelected}
                        >
                          {UserRole.READONLY_USER === userRole ? <></> : <TableCell role="checkbox"></TableCell>}

                          <TableCell align="left" size="small">
                            <Box display={"flex"} alignItems={"center"}>
                              {`${subdomain.name}.${row?.site_id}`}
                            </Box>
                          </TableCell>
                          <TableCell align="left" size="small">
                            {subdomain?.addr}
                          </TableCell>
                          <TableCell align="left" size="small">
                            {subdomain?.waf_detections ?? (
                              <Skeleton height="22px" width="100%" py="5px" variant="rectangular" sx={{ borderRadius: "11px" }} />
                            )}
                          </TableCell>
                          <TableCell align="left" size="small"></TableCell>
                          <TableCell align="left" size="small">
                            {getStatusString(subdomain?.status) ?? (
                              <Skeleton height="22px" width="100%" py="5px" variant="rectangular" sx={{ borderRadius: "11px" }} />
                            )}
                          </TableCell>
                          {sauser && <TableCell align="left" size="small"></TableCell>}
                          <TableCell align="left" size="small"></TableCell>
                        </TableRow>
                      );
                    });
                  }
                  return retRows;
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>
      <SiteModal open={open} handleClose={handleClose} site={site} />
      <DeleteSiteModal
        open={deleteOpen}
        handleClose={deleteHandleClose}
        siteID={0 < selected.length ? selected : siteID}
        deleteFlag={deleteFlag}
        removeFlag={removeFlag}
      />
      <DeleteLogModal
        open={logOpen}
        handleClose={logHandleClose}
        siteID={0 < selected.length ? selected : siteID}
        setMessage={setMessage}
        setSuccess={setSuccess}
        setSnackOpen={setSnackOpen}
      />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem onClick={dashboardClick} disableRipple>
          <DashboardIcon />
          <Typography variant="menuSmall">Dashboard</Typography>
        </MenuItem>
        <MenuItem onClick={configurationClick} disableRipple>
          <SettingIcon />
          <Typography variant="menuSmall">Configuration</Typography>
        </MenuItem>
        {UserRole.READONLY_USER === userRole ? (
          null
        ) : (
          [
            <MenuItem onClick={editClick} disableRipple key={0}>
              <EditIcon />
              <Typography variant="menuSmall">Edit</Typography>
            </MenuItem>,
            deleted ? (
              <MenuItem onClick={restoreClick} disableRipple key={1}>
                <RestoreIcon />
                <Typography variant="menuSmall">Restore</Typography>
              </MenuItem>
            ) : (
              <MenuItem onClick={deleteClick} disableRipple key={1}>
                <DeleteIcon />
                <Typography variant="menuSmall">Delete</Typography>
              </MenuItem>
            )
          ]
        )}
        {sauser && (
          [
            <hr key={0} />,
            <MenuItem key={1} onClick={deleteLogClick} disableRipple>
              <DeleteLogIcon />
              <Typography variant="menuSmall">Remove Log</Typography>
            </MenuItem>,
            <MenuItem key={2} onClick={removeClick} disableRipple>
              <RemoveIcon />
              <Typography variant="menuSmall">Remove</Typography>
            </MenuItem>
          ]
        )}
      </StyledMenu>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </>
  );
}
SiteTable.propTypes = { refresh: PropTypes.func.isRequired, downloadWebsites: PropTypes.func.isRequired };

export default SiteTable;
