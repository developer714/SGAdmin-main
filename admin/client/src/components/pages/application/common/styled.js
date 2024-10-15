import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { rgba } from "polished";
import { spacing } from "@mui/system";
import { alpha } from "@mui/material/styles";
import {
  Alert as MuiAlert,
  Box as MuiBox,
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Collapse,
  Divider as MuiDivider,
  IconButton as MuiIconButton,
  InputBase,
  Grid,
  Menu,
  MenuItem as MuiMenuItem,
  Paper as MuiPaper,
  Switch,
  Snackbar as MuiSnackbar,
  TextField as MuiTextField,
  Typography as MuiTypography,
  // AlertTitle as MuiAlertTitle,
  LinearProgress as MuiLinearProgress,
} from "@mui/material";

import MuiLoadingButton from "@mui/lab/LoadingButton";
import CloseIcon from "@mui/icons-material/Close";

import { RangePicker as MuiRangePicker } from "react-minimal-datetime-range";

const Alert = styled(MuiAlert)(spacing);
// const AlertTitle = styled(MuiAlertTitle)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Button = styled(MuiButton)(spacing);
const Snackbar = styled(MuiSnackbar)(spacing);
const LinearProgress = styled(MuiLinearProgress)(spacing);

const ModalButton = styled(Button)`
  width: 158px;
  height: 40px;
`;

const Box = styled(MuiBox)`
  background: ${() => "white"};
  color: ${(props) => props.theme.sidebar.activeColor};
  border: 1px solid ${(props) => props.theme.sidebar.activeColor};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  max-height: 90vh;
  overflow: auto;
`;

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100px;
`;

const LoadingButton = styled(MuiLoadingButton)`
  font-size: 15px;
  background-color: #369f33;
`;
const IconButton = styled(MuiIconButton)`
  padding: 10px;
  svg {
    width: 24px;
    height: 24px;
  }
`;
const AndBox = styled.div`
  border: solid 1px rgba(0, 0, 0, 0.5);
  padding: 6px 16px;
  border-radius: 4px;
  width: min-content;
`;
const OrBox = styled.div`
  border: solid 1px rgba(0, 0, 0, 0.5);
  padding: 6px 16px;
  margin: 24px 0px;
  border-radius: 4px;
  width: min-content;
`;
const Search = styled.div`
  background-color: ${(props) => props.theme.palette.background};
  position: relative;
  height: 48px;
  border: solid 1px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
`;
const SearchIconWrapper = styled.div`
  width: 34px;
  height: 100%;
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  z-index: 1;
  svg {
    width: 16px;
    height: 16px;
  }
`;
const Input = styled(InputBase)`
  color: inherit;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  > input {
    color: ${(props) => props.theme.palette.primary.main};
    padding-left: 34px !important;
    padding-right: ${(props) => props.theme.spacing(2.5)};
  }
`;
const MenuItem = styled(MuiMenuItem)`
  border-top: solid 1px #ccc;
  border-left: solid 1px #ccc;
  border-right: solid 1px #ccc;
  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  &:last-child {
    border-bottom: solid 1px #ccc;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const RangePicker = styled(MuiRangePicker)(spacing);

const IOSSwitch = styled((props) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
  width: 44,
  height: 22,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(22px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "main",
        // theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      // "&.Mui-disabled + .MuiSwitch-track": {
      //   opacity: 0.5,
      // },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    // "&.Mui-disabled .MuiSwitch-thumb": {
    //   color: theme.palette.grey[100],
    // },
    "&.Mui-disabled .MuiSwitch-track": {
      backgroundColor: "#646464",
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 18,
    height: 18,
  },
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    backgroundColor: "#646464",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const Paper = styled(MuiPaper)(spacing);

const TextField = styled(MuiTextField)`
  width: 70px;
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`;

const OutlinedText = styled(MuiTextField)`
  borderradius: 2px;
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`;

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "3px",
    marginTop: theme.spacing(1),
    background: "white",
    minWidth: 120,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "8px 0",
    },
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
}));

const CardStyle = (props) => css`
  background: ${rgba(props.theme.palette.primary.main, 0)};
  color: ${props.theme.palette.primary.main};
`;
const Card = styled(MuiCard)`
  position: relative;
  border-radius: 3px;
  ${CardStyle};
`;
const CardContent = styled(MuiCardContent)`
  position: relative;
  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)};
  }
`;

const Span = styled.div`
  width: 1px;
  heigth: 10vw !important;
  border-left: solid 1px #ccc;
  height: -webkit-fill-available;
`;

const VerticalDivider = (props) => {
  const { isMD } = props;
  return isMD ? (
    <Grid
      item
      xs={12}
      md={2}
      px={12}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0px",
        paddingLeft: "24px",
      }}
    >
      <Span />
    </Grid>
  ) : (
    <></>
  );
};

const HorizontalDivider = (props) => {
  const { isMD } = props;
  return isMD ? (
    <>
      <Grid item xs={12} md={5}>
        <Divider my={4} />
      </Grid>
      <Grid item xs={12} md={2}></Grid>
      <Grid item xs={12} md={5}>
        <Divider my={4} />
      </Grid>
    </>
  ) : (
    <></>
  );
};

const SnackbarAlert = (props) => {
  const { open, onClose, severity, message } = props;
  if (!open || !message) return <></>;
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      sx={{ whiteSpace: "pre-line" }}
    >
      <Alert
        onClose={onClose}
        variant="contained"
        severity={severity}
        sx={{
          backgroundColor: severity === "success" ? "#017306D9" : "#DE0000D9",
          color: "white",
        }}
      >
        {"error" === severity ? (
          <Typography color="white" my={0.75}>
            Error
          </Typography>
        ) : "success" === severity && "Success" !== message ? (
          <Typography color="white" my={0.75}>
            Success
          </Typography>
        ) : (
          <></>
        )}
        <Typography sx={{ lineHeight: "18px", color: "white", maxWidth: 480, maxHeight: 240, overflow: "auto", wordBreak: "break-all" }}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

const Typography = styled(MuiTypography)(spacing);

const CollapseAlert = (props) => {
  const { errOpen, setErrOpen, errMsg, setErr } = props;
  if (undefined === errMsg || null === errMsg) {
    return <></>;
  }
  return (
    <Collapse in={errOpen}>
      <Alert
        my={4}
        severity="error"
        variant="outlined"
        sx={{ display: "flex", alignItems: "center" }}
        action={
          <IconButton
            onClick={() => {
              setErr(null);
              setErrOpen(false);
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        }
      >
        {errMsg}
      </Alert>
    </Collapse>
  );
};

export {
  Alert,
  AndBox,
  Box,
  Button,
  ModalButton,
  Card,
  CardContent,
  CardStyle,
  Divider,
  IconButton,
  Input,
  IOSSwitch,
  LoadingButton,
  MenuItem,
  OrBox,
  Paper,
  RangePicker,
  Root,
  Search,
  SearchIconWrapper,
  StyledMenu,
  TextField,
  OutlinedText,
  Typography,
  VerticalDivider,
  HorizontalDivider,
  SnackbarAlert,
  CollapseAlert,
  LinearProgress,
};
