// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function FormControlLabel(theme) {
  return {
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0,
        },
        label: {
          ...theme.typography.p2,
        },
      },
    },
  };
}
