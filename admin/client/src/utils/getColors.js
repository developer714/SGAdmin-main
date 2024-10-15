// ==============================|| CUSTOM FUNCTION - COLORS ||============================== //
const getColors = (theme, color) => {
  switch (color) {
    case "primary":
      return theme.palette.primary;
    case "secondary":
      return theme.palette.grey;
    case "darkgreen":
      return theme.palette.darkgreen;
    case "darkteal":
      return theme.palette.darkteal;
    case "orange":
      return theme.palette.orange;
    case "green":
      return theme.palette.green;
    case "brown":
      return theme.palette.brown;
    case "darkblue":
      return theme.palette.darkblue;
    case "grey":
      return theme.palette.grey;
    case "error":
      return theme.palette.error;
    case "warning":
      return theme.palette.warning;
    case "info":
      return theme.palette.info;
    case "danger":
      return theme.palette.error;
    case "success":
      return theme.palette.success;
    case "tab":
      return theme.palette.tab;
    default:
      return theme.palette.darkgreen;
  }
};

export default getColors;
