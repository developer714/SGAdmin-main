// ==============================|| OVERRIDES - ALERT TITLE ||============================== //

export default function AccordionDetails(theme) {
  return {
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          background: "transparent",
          padding: "0px",
          borderTop: `solid 1px ${theme.palette.custom.grey.light}`,
        },
      },
    },
  };
}
