// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function Table() {
  return {
    MuiTable: {
      styleOverrides: {
        root: {
          display: "table",
          width: "100%",
          borderCollapse: "separate",
          // borderSpacing: "2px",
        },
      },
    },
  };
}
