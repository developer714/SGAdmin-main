import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { rgba } from "polished";
import { Skeleton, Card as MuiCard, CardContent as MuiCardContent, useTheme, Stack } from "@mui/material";
import { formatNumbers } from "../../../../utils/format";
import { Typography } from "../common/styled";

const illustrationCardStyle = (props) => css`
  background: ${rgba(props.theme.palette.primary.main, 0)};
  color: ${props.theme.palette.primary.main};
  border: solid 1px #ccc;
`;
const Card = styled(MuiCard)`
  height: 143px;
  position: relative;
  box-shadow: none;
  border-radius: 3px;
  ${illustrationCardStyle};
`;
const CardContent = styled(MuiCardContent)`
  padding: 0px;
  position: relative;
  text-align: center;
  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)};
  }
`;

const Stats = ({ loading, title, now }) => {
  const theme = useTheme();
  return (
    <>
      {title !== "Websites" && !loading ? (
        <Card style={{ background: theme.palette.custom.white.lightblue, borderRadius: "8px", border: "none" }}>
          <CardContent>
            <Stack direction="column" alignItems="center" width="100%">
              <Typography variant="textSemiBold" mt={2.5}>
                {title}
              </Typography>
              <Typography variant="h1" mt={10}>
                {formatNumbers(now)}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ background: theme.palette.custom.white.lightblue, borderRadius: "8px", border: "none" }}>
          <CardContent>
            <Stack direction="column" alignItems="center" width="100%" padding={2.5} spacing={10}>
              {loading ? (
                <>
                  <Typography variant="textSemiBold">{title}</Typography>
                  <Skeleton sx={{ width: "80%", margin: "auto" }} />
                </>
              ) : (
                <>
                  <Typography variant="textSemiBold">{title}</Typography>
                  <Typography variant="h2">{formatNumbers(now)}</Typography>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Stats;
