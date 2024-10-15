import * as React from "react";
import styled from "@emotion/styled";
import AccountIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

import { Tooltip, Menu, MenuItem, IconButton as MuiIconButton, ListItemText as MuiListItemText } from "@mui/material";

import useAuth from "../../hooks/useAuth";

const IconButton = styled(MuiIconButton)`
  padding: 16px 32px;
  svg {
    width: 30px;
    height: 30px;
  }
  align-items: center;
  color: ${(props) => props.theme.header.color};
`;
const IconText = styled(MuiListItemText)`
  padding-left: 8px;
  span {
    font-size: 16px;
  }
`;
function NavbarUserDropdown() {
  const [anchorMenu, setAnchorMenu] = React.useState(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const toggleMenu = (event) => {
    setAnchorMenu(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorMenu(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/signin");
  };
  const handleProfile = async () => {
    closeMenu();
    navigate("/profile/personal");
  };
  const handleUsers = async () => {
    closeMenu();
    navigate("/account/users");
  };
  return (
    <React.Fragment>
      <Tooltip title="Account">
        <IconButton
          aria-owns={Boolean(anchorMenu) ? "menu-appbar" : undefined}
          aria-haspopup="true"
          onClick={toggleMenu}
          color="inherit"
          size="large"
        >
          <AccountIcon />
          <IconText primary={"Account"} />
        </IconButton>
      </Tooltip>
      <Menu id="menu-appbar" anchorEl={anchorMenu} open={Boolean(anchorMenu)} onClose={closeMenu}>
        <MenuItem onClick={handleProfile}>My Profile</MenuItem>
        <MenuItem onClick={handleUsers}>Users</MenuItem>
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>
    </React.Fragment>
  );
}

export default NavbarUserDropdown;
