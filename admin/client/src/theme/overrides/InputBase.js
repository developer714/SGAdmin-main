// ==============================|| OVERRIDES - INPUT BASE ||============================== //

export default function InputBase(theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        sizeSmall: {
          fontSize: "0.75rem",
        },
        root: {
          backgroundColor: theme.palette.custom.white.main,
          borderRadius: "2px",
          borderColor: theme.palette.grey.lighter,
          "& input.MuiInputBase-input": { padding: "10px 14px" },
          "& textarea.MuiInputBase-inputMultiline": {
            ...theme.typography.menuSmall,
          },
        },
      },
    },
  };
}
