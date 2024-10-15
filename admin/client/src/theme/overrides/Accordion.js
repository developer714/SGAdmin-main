// ==============================|| OVERRIDES - ALERT TITLE ||============================== //

export default function Accordion() {
  return {
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        square: true,
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: "white",
          borderRadius: "8px",
          "&:not(:last-child)": {
            borderBottom: 0,
          },
          "&:before": {
            display: "none",
          },
        },
      },
    },
  };
}
