import styled from "@emotion/styled";
import { alpha } from "@mui/material/styles";
import { Menu } from "@mui/material";

import { ReactComponent as Clock } from "../../../../vendor/event/clock.svg";

const Search = styled.div`
  background-color: ${(props) => props.theme.palette.background};
  position: relative;
  width: 100%;
  height: 51px;
  border: solid 1px rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  margin-right: 30px;
`;
const ClockIcon = styled(Clock)`
padd
    width: 32px;
    height: 32px;
`;
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "left",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "left",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "3px",
    marginTop: theme.spacing(1),
    minWidth: 120,
    width: 240,
    color: "rgba(0, 0, 0, 0.87)",
    padding: "0px",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
      },
      "&:active": {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },

  "& .MuiList-root": {
    padding: "0px",
  },
}));

export { ClockIcon, Search, StyledMenu };
