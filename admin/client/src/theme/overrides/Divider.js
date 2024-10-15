// ==============================|| OVERRIDES - DIVIDER ||============================== //

export default function Divider(theme) {
  return {
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.grey[300],
        },
      },
    },
  };
}
