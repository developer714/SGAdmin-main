import PropTypes from "prop-types";
import { Box, Select, useTheme } from "@mui/material";
import { MenuItem, RangePicker } from "../pages/application/common/styled";
import { getPeriodString } from "../pages/application/analytics/common";

function TimeRangePicker({ selectPeriod, selectCustomDateRange, timeRange, customDateRange }) {
  const theme = useTheme();
  return (
    <>
      <Box>
        <RangePicker
          locale="en-us"
          show={false}
          disabled={false}
          allowPageClickToClose={true}
          onConfirm={(res) => selectCustomDateRange(res)}
          placeholder={["Start Time", "End Time"]}
          showOnlyTime={false}
          defaultDates={[customDateRange[0].split("T")[0], customDateRange[1].split("T")[0]]}
          defaultTimes={[customDateRange[0].split("T")[1].substring(0, 5), customDateRange[1].split("T")[1].substring(0, 5)]}
          initialDates={[customDateRange[0].split("T")[0], customDateRange[1].split("T")[0]]}
          initialTimes={[customDateRange[0].split("T")[1].substring(0, 5), customDateRange[1].split("T")[1].substring(0, 5)]}
        />
      </Box>

      <Select
        value={timeRange}
        fullWidth
        sx={{ color: theme.palette.grey.main, border: "none" }}
        onChange={(e) => {
          if (e.target.value === "custom_value") {
            selectPeriod("custom");
          } else {
            selectPeriod(e.target.value);
          }
        }}
      >
        {["30m", "60m", "3h", "6h", "24h", "3d", "7d", "1M"].map((period) => (
          <MenuItem key={`period_${period}`} value={period} sx={{ color: theme.palette.grey.main }}>
            {getPeriodString(period, customDateRange)}
          </MenuItem>
        ))}
        <MenuItem key={`period_custom`} value="custom_value" sx={{ color: theme.palette.grey.main }}>
          Custom ...
        </MenuItem>
        <MenuItem key={`period_custom_1`} value="custom" sx={{ display: "none" }}>
          {getPeriodString("custom", customDateRange)}
        </MenuItem>
      </Select>
    </>
  );
}

TimeRangePicker.propTypes = {
  selectPeriod: PropTypes.func.isRequired,
  selectCustomDateRange: PropTypes.func.isRequired,
};

export default TimeRangePicker;
