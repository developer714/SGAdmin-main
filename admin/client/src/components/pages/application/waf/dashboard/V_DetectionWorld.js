import React, { lazy, Suspense } from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { CardContent as MuiCardContent, Card as MuiCard, CircularProgress } from "@mui/material";

import { CountryData } from "./country.js";
import useSite from "../../../../../hooks/user/useSite";
import { CardStyle } from "../../common/styled.js";

const VectorMap = lazy(() => import("../../lazy/VectorMap"));

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;
const Card = styled(MuiCard)`
  position: relative;
  border-radius: 3px;
  width: calc(100%- 258px);
  height: calc(40vw - 90px);
  ${CardStyle};
`;
const CardContent = styled(MuiCardContent)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  &:last-child {
    padding-bottom: ${(props) => props.theme.spacing(4)};
  }
`;
function World(props) {
  const theme = useTheme();
  const { regional_detections } = useSite();
  const [options, setOptions] = React.useState({
    map: "world_mill",
    regionStyle: {
      initial: {
        fill: "#e3eaef",
      },
    },
    backgroundColor: "transparent",
    containerStyle: {
      width: "100%",
      height: "100%",
    },
    markerStyle: {
      initial: {
        r: 9,
        fill: theme.palette.custom.blue.opacity_80,
        "fill-opacity": 1,
        stroke: "#fff",
        "stroke-width": 7,
        "stroke-opacity": 0.4,
      },
      hover: {
        stroke: "#fff",
        "fill-opacity": 1,
        "stroke-width": 1.5,
      },
    },
    markers: [],
    zoomOnScroll: false,
  });
  React.useEffect(() => {
    if (regional_detections?.length > 0) {
      var markers = [];
      for (let regional_detection of regional_detections) {
        const countryData = CountryData[regional_detection.key.toUpperCase()];
        markers.push({
          latLng: [countryData?.x, countryData?.y],
          name: countryData?.country,
          value: regional_detection.doc_count,
        });
      }
      setOptions({
        map: "world_mill",
        regionStyle: {
          initial: {
            fill: "#e3eaef",
          },
        },
        backgroundColor: "transparent",
        containerStyle: {
          width: "100%",
          height: "100%",
        },
        markerStyle: {
          initial: {
            r: 9,
            fill: theme.palette.custom.blue.opacity_80,
            "fill-opacity": 1,
            stroke: "#fff",
            "stroke-width": 7,
            "stroke-opacity": 0.4,
          },
          hover: {
            stroke: "#fff",
            "fill-opacity": 1,
            "stroke-width": 1.5,
          },
        },
        markers: markers,
        onMarkerTipShow: function (e, el, code) {
          el.html(el.html() + "<br> (Requests - " + markers[code].value + ")");
        },
        zoomOnScroll: false,
      });
    } else {
      setOptions({
        map: "world_mill",
        regionStyle: {
          initial: {
            fill: "#e3eaef",
          },
        },
        backgroundColor: "transparent",
        containerStyle: {
          width: "100%",
          height: "100%",
        },
        markerStyle: {
          initial: {
            r: 9,
            fill: theme.palette.custom.blue.opacity_80,
            "fill-opacity": 1,
            stroke: "#fff",
            "stroke-width": 7,
            "stroke-opacity": 0.4,
          },
          hover: {
            stroke: "#fff",
            "fill-opacity": 1,
            "stroke-width": 1.5,
          },
        },
        markers: [],
        zoomOnScroll: false,
      });
    }
  }, [regional_detections]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card sx={{ boxShadow: "none" }}>
      <CardContent sx={{ background: "white" }}>
        {regional_detections === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <Suspense
            fallback={
              <Root>
                <CircularProgress color="primary" />
              </Root>
            }
          >
            <VectorMap {...options} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  );
}

export default withTheme(World);
