// ==============================|| OVERRIDES - LIST ITEM ICON ||============================== //

export default function ListItemButton(theme) {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: theme.palette.darkgreen.main,
            "& .MuiListItemIcon-root": {
              color: theme.palette.darkgreen.main,
            },
          },
        },
      },
    },
  };
}
