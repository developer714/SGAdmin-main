// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function Select(theme) {
  return {
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          PaperProps: {
            style: {
              maxHeight: 240,
              borderRadius: "0px 0px 8px 8px",
            },
          },
          MenuListProps: {
            disablePadding: true,
            borderRadius: "0px 0px 8px 8px",
          },
        },
      },
      styleOverrides: {
        root: {
          ...theme.typography.h3,
          backgroundColor: "#FFFFFF",
          height: "48px",
        },
        notchedOutline: {
          border: "none",
        },
      },
    },
  };
}
