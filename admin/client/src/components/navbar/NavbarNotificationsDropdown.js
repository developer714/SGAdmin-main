import React, { useRef, useState } from "react";
// import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { formatDate } from "../../utils/format";

import {
  Badge,
  Box,
  // Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon,
  Tooltip,
  Typography,
  Avatar as MuiAvatar,
  Popover as MuiPopover,
  Grid,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

// import { Bell, Home, UserPlus, Server } from "react-feather";
import { Bell as BellIcon } from "react-feather";
import useAuth from "../../hooks/useAuth";

const Bell = styled(BellIcon)`
  color: ${(props) => props.theme.palette.grey.darker};
  width: 24px;
  height: 24px;
`;
const Popover = styled(MuiPopover)`
  .MuiPaper-root {
    width: 600px;
    ${(props) => props.theme.shadows[1]};
    border: 1px solid ${(props) => props.theme.palette.divider};
  }
`;

const Indicator = styled(Badge)`
  .MuiBadge-badge {
    background: ${(props) => props.theme.header.indicator.background};
    color: ${(props) => props.theme.palette.common.white};
  }
`;

const Avatar = styled(MuiAvatar)`
  background: ${(props) => props.theme.palette.primary.main};
`;

const NotificationHeader = styled(Box)`
  text-align: center;
  border-bottom: 1px solid ${(props) => props.theme.palette.divider};
`;
function Notification({ notification }) {
  const { markNotificationAsRead } = useAuth();
  const [loading, setLoading] = useState(false);
  const onMarkAsReadClick = async (e) => {
    setLoading(true);
    await markNotificationAsRead(notification.id);
    setLoading(false);
  };

  return (
    <ListItem
      divider
      secondaryAction={
        !notification.read && (
          <Tooltip title="Mark as read">
            {loading ? (
              <CircularProgress color="primary" size="1rem" />
            ) : (
              <IconButton edge="end" aria-label="Mark as read" onClick={onMarkAsReadClick}>
                <CheckIcon />
              </IconButton>
            )}
          </Tooltip>
        )
      }
    >
      <ListItemAvatar>
        <Avatar>
          <SvgIcon fontSize="small" color={notification.read ? "warning" : "inherit"}>
            <Bell />
          </SvgIcon>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="h2" color={"black"} pb={2}>
            {notification.title}
          </Typography>
        }
        primaryTypographyProps={{
          variant: "subtitle2",
          color: "textPrimary",
        }}
        secondary={
          <>
            <Typography color={"black"}>{formatDate(notification.created)}</Typography>
            <Typography
              sx={{
                whiteSpace: "pre-line",
                overflow: "auto",
                wordBreak: "break-all",
              }}
            >
              {notification.content}
            </Typography>
          </>
        }
      />
    </ListItem>
  );
}

function NavbarNotificationsDropdown() {
  const { notifications, getNotifications4User, markAllNotificationAsRead, isAuthenticated } = useAuth();
  const [newNotiNumber, setNewNotiNumber] = useState(0);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) getNotifications4User();
  }, [isAuthenticated, getNotifications4User]);

  React.useEffect(() => {
    let s = 0;
    if (notifications) {
      notifications.forEach((noti) => {
        if (!noti.read) {
          s++;
        }
      });
    }
    setNewNotiNumber(s);
  }, [notifications]);

  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onMarkAllAsReadClick = async (e) => {
    setLoading(true);
    await markAllNotificationAsRead();
    setLoading(false);
  };

  return (
    <React.Fragment>
      <Tooltip title="Notifications">
        <IconButton color="inherit" ref={ref} onClick={handleOpen} size="large">
          {newNotiNumber > 0 ? (
            <Indicator
              badgeContent={newNotiNumber}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#E60000!important",
                  color: "white!important",
                },
              }}
            >
              <Bell />
            </Indicator>
          ) : (
            <Bell />
          )}
        </IconButton>
      </Tooltip>
      <Popover
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
      >
        <NotificationHeader p={2}>
          {newNotiNumber > 0 ? (
            <Grid container display="flex" alignItems={"center"}>
              <Grid item xs>
                <Typography variant="subtitle1" color="textPrimary">
                  {newNotiNumber} New Notification(s)
                </Typography>
              </Grid>
              <Grid item sx={{ width: "48px" }}>
                <Tooltip title="Mark all as read">
                  {loading ? (
                    <CircularProgress color="primary" size="1rem" />
                  ) : (
                    <IconButton edge="end" aria-label="Mark all as read" onClick={onMarkAllAsReadClick}>
                      <CheckIcon />
                    </IconButton>
                  )}
                </Tooltip>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="subtitle1" color="textPrimary">
              No new notifications
            </Typography>
          )}
        </NotificationHeader>
        <React.Fragment>
          <List disablePadding>
            {notifications?.map((noti) => {
              return <Notification notification={noti} />;
            })}
          </List>
          {/* <Box p={1} display="flex" justifyContent="center">
                        <Button size="small" component={Link} to="#">
                            Show all notifications
                        </Button>
                    </Box> */}
        </React.Fragment>
      </Popover>
    </React.Fragment>
  );
}

export default NavbarNotificationsDropdown;
