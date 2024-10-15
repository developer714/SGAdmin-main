// ==============================|| OVERRIDES - OUTLINED INPUT ||============================== //

export default function OutlinedInput(theme) {
  return {
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          ...theme.typography.input,
          padding: "13px 12px",
        },
        root: {
          borderRadius: "8px",
          border: `1px solid ${theme.palette.custom.grey.dark}`,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        colorSecondary: {
          borderRadius: "8px",
          border: `1px solid ${theme.palette.custom.grey.lines}`,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
        error: {
          borderRadius: "8px",
          border: `1px solid ${theme.palette.custom.red.main}`,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        },
      },
    },
  };
}
