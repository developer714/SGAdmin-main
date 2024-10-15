import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { LogOut, HelpCircle } from "react-feather";
import { Box, useMediaQuery, IconButton as MuiIconButton } from "@mui/material";

import useAuth from "../../hooks/useAuth";

const Footer = styled.div`
  background-color: ${(props) => props.theme.sidebar.footer.background};
  height: 78px;
  border-top: 1px solid ${(props) => props.theme.palette.grey.main};
  border-bottom-right-radius: 20px;
`;
const IconButton = styled(MuiIconButton)`
  padding: 0px;
  color: ${(props) => props.theme.sidebar.color};
`;

const SidebarFooter = ({ ...rest }) => {
  const theme = useTheme();
  const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/signin");
  };

  const handleHelp = () => {
    window.open("https://support.sensedefence.com", "_blank");
  };
  return (
    <Footer {...rest} style={{ borderRadius: 0 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: isLG ? "space-between" : "end",
          alignItems: "center",
          height: "100%",
          padding: 0,
        }}
      >
        {isLG && (
          <IconButton aria-label="help" size="large" onClick={handleHelp} sx={{ ml: 8 }}>
            <HelpCircle />
          </IconButton>
        )}
        <IconButton aria-label="sign-out" size="large" sx={{ alignItems: "right", mr: isLG ? 8 : 2.5 }} onClick={handleSignOut}>
          <LogOut />
        </IconButton>
      </Box>
    </Footer>
  );
};

export default SidebarFooter;
