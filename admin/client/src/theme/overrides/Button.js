import getColors from "../../utils/getColors";
// ==============================|| OVERRIDES - BUTTON ||============================== //

function getColorStyle({ variant, color, theme }) {
  const colors = getColors(theme, color);
  const { main, contrast, text, contrastText } = colors;
  switch (variant) {
    case "contained":
      return {
        backgroundColor: main,
        border: `solid 1px ${main}`,
        color: text,
        "&:hover": {
          backgroundColor: contrast,
          color: contrastText,
          border: `solid 1px ${contrast}`,
        },
        "&:active": {
          backgroundColor: contrast,
          color: contrastText,
          border: `solid 1px ${contrast}`,
        },
        "&.Mui-disabled": {
          backgroundColor: theme.palette.grey.light,
          border: `solid 1px ${theme.palette.grey.light}`,
          color: contrastText,
        },
      };
    case "outlined":
      return {
        color: main,
        border: `solid 1px ${main}`,
        backgroundColor: "white",
        "&:hover": {
          color: theme.palette.custom.white.bglight,
          border: `solid 1px ${main}`,
          backgroundColor: main,
        },
        "&:active": {
          color: theme.palette.custom.white.bglight,
          border: `solid 1px ${main}`,
          backgroundColor: main,
        },
        "&.Mui-disabled": {
          color: theme.palette.grey.light,
        },
      };
    case "text":
    default:
      return {
        color: contrastText,
        backgroundColor: "transparent",
        padding: "4px 8px!important",
        "&:hover": {
          color: main,
          backgroundColor: "transparent",
        },
        "&:active": {
          color: main,
          backgroundColor: "transparent",
        },
        "&.Mui-disabled": {
          color: theme.palette.grey.light,
        },
      };
  }
}

export default function Button(theme) {
  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },

      styleOverrides: {
        root: {
          borderRadius: "2px",
        },
        contained: getColorStyle({
          variant: "contained",
          color: "darkgreen",
          theme,
        }),
        outlined: getColorStyle({
          variant: "outlined",
          color: "darkgreen",
          theme,
        }),
        text: getColorStyle({
          variant: "text",
          color: "darkgreen",
          theme,
        }),
        containedPrimary: getColorStyle({
          variant: "contained",
          color: "primary",
          theme,
        }),
        containedSecondary: getColorStyle({
          variant: "contained",
          color: "secondary",
          theme,
        }),
        containedError: getColorStyle({
          variant: "contained",
          color: "error",
          theme,
        }),
        containedSuccess: getColorStyle({
          variant: "contained",
          color: "success",
          theme,
        }),
        containedInfo: getColorStyle({
          variant: "contained",
          color: "info",
          theme,
        }),
        containedWarning: getColorStyle({
          variant: "contained",
          color: "warning",
          theme,
        }),
        containedGrey: getColorStyle({
          variant: "contained",
          color: "grey",
          theme,
        }),
        outlinedPrimary: getColorStyle({
          variant: "outlined",
          color: "primary",
          theme,
        }),
        outlinedSecondary: getColorStyle({
          variant: "outlined",
          color: "secondary",
          theme,
        }),
        outlinedError: getColorStyle({
          variant: "outlined",
          color: "error",
          theme,
        }),
        outlinedSuccess: getColorStyle({
          variant: "outlined",
          color: "success",
          theme,
        }),
        outlinedInfo: getColorStyle({
          variant: "outlined",
          color: "info",
          theme,
        }),
        outlinedWarning: getColorStyle({
          variant: "outlined",
          color: "warning",
          theme,
        }),
        textPrimary: getColorStyle({
          variant: "text",
          color: "primary",
          theme,
        }),
        textSecondary: getColorStyle({
          variant: "text",
          color: "secondary",
          theme,
        }),
        textError: getColorStyle({
          variant: "text",
          color: "error",
          theme,
        }),
        textSuccess: getColorStyle({
          variant: "text",
          color: "success",
          theme,
        }),
        textInfo: getColorStyle({
          variant: "text",
          color: "info",
          theme,
        }),
        textWarning: getColorStyle({
          variant: "text",
          color: "warning",
          theme,
        }),
        // custom color scheme - tab
        containedTab: getColorStyle({
          variant: "contained",
          color: "tab",
          theme,
        }),
        outlinedTab: getColorStyle({
          variant: "outlined",
          color: "tab",
          theme,
        }),
        textTab: getColorStyle({
          variant: "text",
          color: "tab",
          theme,
        }),
        endIcon: {
          marginLeft: "8px",
          marginRight: "0px",
        },
        startIcon: {
          marginLeft: "0px",
          marginRight: "8px",
        },
        iconSizeSmall: {
          "& svg": {
            fontSize: "12px",
          },
        },
        iconSizeMedium: {
          "& svg": {
            fontSize: "14px",
          },
        },
        iconSizeLarge: {
          "& svg": {
            fontSize: "16px",
          },
        },
        sizeLarge: {
          ...theme.typography.p2m,
          lineHeight: "20px",
          padding: "16px 32px",
        },
        sizeMedium: {
          ...theme.typography.p3m,
          lineHeight: "18px",
          padding: "12px 24px",
        },
        sizeSmall: {
          ...theme.typography.p4m,
          lineHeight: "16px",
          padding: "10px 16px",
        },
        sizeUi: {
          ...theme.typography.p4m,
          width: "160px",
          height: "48px",
          borderRadius: "8px",
        },
        sizeModal: {
          ...theme.typography.p4m,
          width: "158px",
          height: "40px",
        },
      },
    },
  };
}
