import { Button as MuiButton, Stack, Typography, useTheme, styled, TablePagination as MuiTablePagination } from "@mui/material";

import { ReactComponent as FirstIcon } from "../../vendor/button/first.svg";
import { ReactComponent as PrevIcon } from "../../vendor/button/prev.svg";
import { ReactComponent as NextIcon } from "../../vendor/button/next.svg";
import { ReactComponent as LastIcon } from "../../vendor/button/last.svg";

const Button = styled(MuiButton)`
  min-width: 32px;
  width: 32px;
  min-height: 32px;
  height: 32px;
  padding: 0px;
  border-radius: 8px;
  border: 1px solid #e9e9e9;
`;

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, rowsPerPage, page, onPageChange } = props;
  const totalPages = Math.ceil(count / rowsPerPage);
  const startPageIndex = Math.max(0, page - 2);
  const endPageIndex = Math.min(totalPages - 1, page + 2);
  const indexArray = [];
  if (startPageIndex > 0) indexArray.push("...");
  for (let i = startPageIndex; i <= endPageIndex; i++) indexArray.push(i);
  if (endPageIndex < totalPages - 1) indexArray.push("...");

  return (
    <Stack direction="row" alignItems="center" justifyContent="end" pr={2} spacing={"5px"}>
      <Button variant="outlined" onClick={(e) => onPageChange(e, 0)}>
        <FirstIcon />
      </Button>
      <Button variant="outlined" onClick={(e) => onPageChange(e, Math.max(0, page - 1))}>
        <PrevIcon />
      </Button>
      {indexArray.map((value) => {
        return (
          <Button
            variant="outlined"
            onClick={(e) => onPageChange(e, value)}
            disabled={typeof value !== "number"}
            sx={{
              background: page === value ? theme.palette.primary.light : "white",
              color: page === value ? theme.palette.primary.text : theme.palette.primary.contrastText,
            }}
          >
            {typeof value === "number" ? value + 1 : value}
          </Button>
        );
      })}
      <Button variant="outlined" onClick={(e) => onPageChange(e, Math.min(totalPages - 1, page + 1))}>
        <NextIcon />
      </Button>
      <Button variant="outlined" onClick={(e) => onPageChange(e, totalPages - 1)}>
        <LastIcon />
      </Button>
    </Stack>
  );
}

function TablePagination(props) {
  return (
    <MuiTablePagination
      {...props}
      labelDisplayedRows={() => <></>}
      SelectProps={{
        sx: { height: "42px", border: "1px solid #e9e9e9", borderRadius: "8px", marginLeft: "10px", marginRight: "20px" },
      }}
      labelRowsPerPage={<Typography variant="textSemiBold">Rows per page</Typography>}
      ActionsComponent={TablePaginationActions}
    />
  );
}

export default TablePagination;
