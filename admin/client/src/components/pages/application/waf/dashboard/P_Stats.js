import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { rgba } from "polished";
import { Skeleton, Box as MuiBox, Card as MuiCard, CardContent as MuiCardContent } from "@mui/material";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";

import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { formatNumbers, formatPeriod2HumanReadable } from "../../../../../utils/format";
import { Typography } from "../../common/styled";

const illustrationCardStyle = (props) => css`
  background: ${rgba(props.theme.palette.primary.main, 0)};
  color: ${props.theme.palette.primary.main};
  border: solid 1px #ccc;
`;
const Card = styled(MuiCard)`
  height: 144px;
  position: relative;
  box-shadow: none;
  border-radius: 3px;
  ${illustrationCardStyle};
`;
const CardContent = styled(MuiCardContent)`
  position: relative;
  text-align: center;
  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)};
  }
`;
const Box = styled(MuiBox)`
  display: inline-flex;
  align-items: center;
`;
const getPeriodString = (timeRange, now, past) => {
  const humanReadableTimeRange = formatPeriod2HumanReadable(timeRange);
  if (humanReadableTimeRange) {
    return (
      <>
        <MuiBox>
          <Typography>Compared to previous {humanReadableTimeRange}</Typography>
        </MuiBox>
        <Typography pt={2}>
          Current:&nbsp;&nbsp;
          {formatNumbers(now)}
        </Typography>
        <Typography>
          Previous:&nbsp;&nbsp;
          {formatNumbers(past)}
        </Typography>
      </>
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
        <Typography pt={2}>
          Current:&nbsp;&nbsp;
          {formatNumbers(now)}
        </Typography>
      </>
    );
  }
};
const HtmlTooltip = styled(({ className, ...props }) => <Tooltip {...props} arrow classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "rgba(0,0,0,0.75)",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "rgba(255, 255, 255, 1)",
    maxWidth: 260,
    padding: "8px",
    border: "1px solid #ccc",
  },
}));
const Stats = ({ loading, title, timeRange, arrow, percent, now, past }) => {
  return (
    <>
      {loading ? (
        <Card>
          <CardContent>
            <Typography variant="textSemiBold" mb={4} pt={1}>
              <Skeleton />
            </Typography>
            <Typography variant="h1">
              <Skeleton />
            </Typography>
            <Box height="36px">
              <Skeleton width="50px" />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <HtmlTooltip title={<React.Fragment>{getPeriodString(timeRange, now, past)}</React.Fragment>}>
          <Card>
            <CardContent sx={{ padding: 0 }}>
              <Typography variant="textSemiBold" mb={4} pt={"10px"} height={"50px"} display="block">
                {title}
              </Typography>
              <Typography variant="h1" height={"40px"} display="block">
                {formatNumbers(now)}
              </Typography>
              <Box height="36px">
                {arrow === "up" ? (
                  <ArrowDropUpIcon
                    sx={{
                      width: "32px",
                      height: "32px",
                      color: "#FF0000",
                    }}
                  />
                ) : (
                  <></>
                )}
                {arrow === "down" ? (
                  <ArrowDropDownIcon
                    sx={{
                      width: "32px",
                      height: "32px",
                      color: "#369F33",
                    }}
                  />
                ) : (
                  <></>
                )}
                <Typography variant="textSmall">{percent + " %"}</Typography>
              </Box>
            </CardContent>
          </Card>
        </HtmlTooltip>
      )}
    </>
  );
};

export default Stats;
