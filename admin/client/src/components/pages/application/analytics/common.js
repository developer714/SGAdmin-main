import { Box, Checkbox, Grid, Tooltip, Typography } from "@mui/material";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { BotScore } from "../../../../utils/constants";
import { formatHttpResponseCode, formatNumbers } from "../../../../utils/format";
import { MenuItem } from "../common/styled";

function KeyValueComponent({ keyStr, valueStr, highlight, keyWidth }) {
  let displayValue = valueStr?.toString() || "-";
  if (displayValue.length > 60) {
    displayValue = displayValue.substring(0, 60) + "...";
  }
  return (
    <Grid item xs={12} display="flex" pl={4} pt={4} alignItems={"center"}>
      <Typography
        sx={{
          width: `${keyWidth ?? 210}px`,
          minWidth: `${keyWidth ?? 210}px`,
          // textAlign: "right",
          wordBreak: "break-all",
          color: "black",
          "text-transform": "capitalize",
        }}
      >
        {keyStr || "-"}
      </Typography>
      <Box sx={{ overflow: "hidden" }}>
        <Tooltip title={valueStr || ""}>
          {highlight ? (
            <Typography
              sx={{
                pl: 3.5,
                width: "max-content",
                color: "#EE0000",
              }}
            >
              <b>{displayValue}</b>
            </Typography>
          ) : (
            <Typography sx={{ pl: 3.5, width: "max-content" }}>{displayValue}</Typography>
          )}
        </Tooltip>
      </Box>
    </Grid>
  );
}

function TitleComponent({ title, ...extra }) {
  return (
    <Grid item xs={12} display="flex" alignItems={"center"}>
      <Typography
        sx={{
          wordBreak: "break-all",
        }}
        variant="h2"
        mt={4}
        {...extra}
      >
        <b>{title}</b>
      </Typography>
    </Grid>
  );
}

function CheckKeyValueComponent({ type, keyStr, valueNumber, isChecked, handleFilterChange }) {
  const handleCheckChange = (e) => {
    handleFilterChange(type, e.target.checked, keyStr);
  };
  const keyText = "res_code" === type ? formatHttpResponseCode(keyStr) : keyStr;
  return (
    <Grid container spacing={2} display="flex" alignItems="center">
      <Grid item xs={10}>
        <Box display="flex" alignItems="center">
          <Checkbox checked={isChecked} onChange={handleCheckChange} />
          <Box sx={{ overflow: "hidden" }}>
            <Tooltip title={keyText}>
              <Typography sx={{ pl: 2, width: "max-content" }}>{keyText}</Typography>
            </Tooltip>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={2} pr={4} textAlign="right">
        {formatNumbers(valueNumber)}
      </Grid>
    </Grid>
  );
}

function CheckKeyAllComponent({ type, values, isChecked, handleFilterAllChange }) {
  const handleCheckChange = (e) => {
    handleFilterAllChange(type, values, e.target.checked);
  };
  return (
    <Grid container spacing={2} display="flex" alignItems="center">
      <Grid item xs={10}>
        <Box display="flex" alignItems="center">
          <Checkbox checked={isChecked} onChange={handleCheckChange} />
          <Box sx={{ overflow: "hidden" }}>
            <Typography sx={{ pl: 2, width: "max-content" }}>Select All</Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

function TabPanel(props) {
  const { children, tabIndex, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={tabIndex !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {tabIndex === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const downloadAsPdf = (elementId, fileName) => {
  const input = document.getElementById(elementId);
  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
      unit: "px",
      format: [input.offsetWidth + 240, input.offsetHeight + 180],
    });
    pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
    pdf.save(fileName);
  });
};

const downloadObjectAsJson = (exportObj, exportName) => {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const getBotType = (bot_score) => {
  if (0 === bot_score) {
    return "Unknown";
  } else if (BotScore.MIN_BAD === bot_score) {
    return "Bad Bot";
  } else if (BotScore.MAX_BAD >= bot_score) {
    return "Likely Bad Bot";
  } else if (BotScore.MAX_GOOD >= bot_score) {
    return "Verified Bots";
  } else {
    return "Likely Human";
  }
};

const getPeriodString = (period, customDateRange) => {
  switch (period) {
    case "30m":
      return "Last 30 Minutes";
    case "60m":
      return "Last 60 Minutes";
    case "1h":
      return "Last 1 Hour";
    case "3h":
      return "Last 3 Hours";
    case "6h":
      return "Last 6 Hours";
    case "12h":
      return "Last 12 Hours";
    case "24h":
      return "Last 24 Hours";
    case "48h":
      return "Last 48 Hours";
    case "1d":
      return "Last 1 Day";
    case "3d":
      return "Last 3 Days";
    case "7d":
      return "Last 7 Days";
    case "1M":
      return "Last 1 Month";
    case "custom":
      return (
        customDateRange[0].split("T")[0] +
        " " +
        customDateRange[0].split("T")[1] +
        " - " +
        customDateRange[1].split("T")[0] +
        " " +
        customDateRange[1].split("T")[1]
      );
    default:
      return "Last 24 Hours";
  }
};

function PeriodItemComponent({ selectPeriod }) {
  const aPeriods = ["30m", "60m", "3h", "6h", "24h", "3d", "7d", "1M"];
  return (
    <>
      {aPeriods.map((period) => (
        <MenuItem onClick={() => selectPeriod(period)} disableRipple>
          {getPeriodString(period)}
        </MenuItem>
      ))}

      <MenuItem onClick={() => selectPeriod("custom")} disableRipple>
        Custom ...
      </MenuItem>
    </>
  );
}

function isReqBlockedBySD(res_code) {
  res_code = parseInt(res_code);
  switch (res_code) {
    case 301:
    case 403:
    case 429:
    case 503:
      return true;
    default:
      return false;
  }
}

function getResStatusString(res_code) {
  res_code = parseInt(res_code);
  switch (res_code) {
    case 301:
    case 403:
    case 429:
      return "Blocked";
    case 503:
      return "Challenged";
    case undefined:
    case null:
    case 0:
      return "Undefined";
    default:
      return "Passed";
  }
}

export {
  downloadAsPdf,
  downloadObjectAsJson,
  getBotType,
  getPeriodString,
  CheckKeyValueComponent,
  CheckKeyAllComponent,
  KeyValueComponent,
  PeriodItemComponent,
  TabPanel,
  TitleComponent,
  isReqBlockedBySD,
  getResStatusString,
};
