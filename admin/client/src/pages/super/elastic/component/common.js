import { Select } from "@mui/material";
import { MenuItem } from "../../../../components/pages/application/common/styled";

function EsMethodValueComponent({ method, handleSelectMethod }) {
  const aMethods = ["GET", "POST", "PUT", "DELETE"];
  return (
    <Select value={method} onChange={handleSelectMethod} sx={{ width: "95%" }}>
      {aMethods.map((methodValue, methodIdx) => (
        <MenuItem key={`_cond${methodIdx + 1}`} value={methodValue}>
          {methodValue}
        </MenuItem>
      ))}
    </Select>
  );
}

export { EsMethodValueComponent };
