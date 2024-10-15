import PropTypes from "prop-types";
import { Stack, Typography, Box as MuiBox } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

import { Box, IconButton } from "../pages/application/common/styled";

function ModalBox(props) {
  const { children, title, handleClose } = props;
  return (
    <Box {...props}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" padding={"6px 16px"} borderBottom={"solid 1px #ccc"}>
        <Typography variant="h2">{title}</Typography>
        <IconButton onClick={handleClose} size="large">
          <CloseIcon />
        </IconButton>
      </Stack>
      <MuiBox padding="0px 20px 20px 20px">{children}</MuiBox>
    </Box>
  );
}

ModalBox.propTypes = {
  handleClose: PropTypes.func.isRequired,
};

export default ModalBox;
