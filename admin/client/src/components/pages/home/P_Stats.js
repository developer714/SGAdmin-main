import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { rgba } from "polished";
import { Skeleton, Box as MuiBox, Card as MuiCard, CardContent as MuiCardContent, Stack } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { formatBytes, formatNumbers, formatPeriod2HumanReadable } from "../../../utils/format";
import { Typography } from "../application/common/styled";

const illustrationCardStyle = (props) => css`
  background: ${rgba(props.theme.palette.primary.main, 0)};
  color: ${props.theme.palette.primary.main};
`;
const Card = styled(MuiCard)`
  position: relative;
  box-shadow: none;
  width: 100%;
  ${illustrationCardStyle};
`;
const CardContent = styled(MuiCardContent)`
  padding: 32px 4px !important;
  position: relative;
  text-align: center;
`;
const Box = styled(MuiBox)`
  display: inline-flex;
  align-items: center;
`;

const getPeriodString = (timeRange, now, past, convert) => {
  const humanReadableTimeRange = formatPeriod2HumanReadable(timeRange);
  if (humanReadableTimeRange) {
    return (
      <Typography>
        Compared to previous {humanReadableTimeRange}
        <br />
        Current:&nbsp;&nbsp;
        {convert ? formatBytes(now) : now}
        <br />
        Previous:&nbsp;&nbsp;
        {convert ? formatBytes(past) : past}
      </Typography>
    );
  } else {
    return (
      <>
        <MuiBox>
          <Typography>
            From:&nbsp;&nbsp;
            {timeRange[0].split("T")[0] + " " + timeRange[0].split("T")[1]}
          </Typography>
          <Typography>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To:&nbsp;&nbsp;
            {timeRange[1].split("T")[0] + " " + timeRange[1].split("T")[1]}
          </Typography>
        </MuiBox>
        <Typography>
          Current:&nbsp;&nbsp;
          {convert ? formatBytes(now) : now}
        </Typography>
      </>
    );
  }
};
const Stats = ({ loading, title, timeRange = null, now, past, convert, arrow = null, color }) => {
  const HtmlTooltip = useMemo(
    () => styled(({ className, ...props }) => <Tooltip {...props} arrow={true} classes={{ popper: className }} />)(({ theme }) => ({})),
    []
  );

  const innerContent = useMemo(
    () => (
      <Card>
        <CardContent>
          <Stack direction="column" spacing={8} sx={{ alignItems: "center" }}>
            {loading ? <Skeleton sx={{ width: "80%", margin: "auto" }} /> : <Typography variant="h2">{title}</Typography>}

            {loading ? (
              <Skeleton sx={{ width: "80%", margin: "auto" }} />
            ) : (
              <Box>
                <Typography variant="number">{title.search("Bandwidth") > 0 ? formatBytes(now) : formatNumbers(now)}</Typography>
                {arrow === "up" ? (
                  <ArrowDropUpIcon
                    sx={{
                      width: "26px",
                      height: "26px",
                      color: { color },
                    }}
                  />
                ) : null}
                {arrow === "down" ? (
                  <ArrowDropDownIcon
                    sx={{
                      width: "26px",
                      height: "26px",
                      color: { color },
                    }}
                  />
                ) : null}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    ),
    [arrow, color, loading, now, title]
  );
  if (title !== "Websites" && !loading) {
    return <HtmlTooltip title={getPeriodString(timeRange, now, past, convert)}>{innerContent}</HtmlTooltip>;
  } else {
    return innerContent;
  }
};

export default Stats;
