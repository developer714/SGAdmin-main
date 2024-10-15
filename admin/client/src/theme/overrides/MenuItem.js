// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function MenuItem(theme) {
  return {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          paddingTop: "5px",
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingBottom: "5px",
          height: "48px",
          "& .MuiTypography-root": {
            ...theme.typography.menuSmall,
            color: theme.palette.custom.grey.black,
          },
          "&:hover": {
            backgroundColor: theme.palette.custom.white.bglight,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.custom.white.bglight,
          },
          "&.Mui-selected:hover": {
            backgroundColor: theme.palette.custom.white.bglight,
          },
          "&:first-child": {
            borderRadius: "8px 8px 0px 0px",
          },
          "&:last-child": {
            borderRadius: "0px 0px 8px 8px",
          },
        },
      },
    },
  };
}
