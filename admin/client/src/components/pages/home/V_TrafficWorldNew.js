import React, { lazy, Suspense } from "react";
import { useTheme } from "@mui/material/styles";

import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { Card as MuiCard, CircularProgress } from "@mui/material";

import { CountryData } from "./country.js";
import useHome from "../../../hooks/user/useHome";
import { CardContent, CardStyle } from "../application/common/styled.js";

const VectorMap = lazy(() => import("../application/lazy/VectorMap"));

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;
const MapContainer = styled.div`
  height: 35vw;
`;

const Card = styled(MuiCard)`
  position: relative;
  box-shadow: none;
  border-radius: 3px;
  ${CardStyle};
`;
function WorldMap(props) {
  const theme = useTheme();

  const { regional_traffics } = useHome();
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
        fill: theme.palette.custom.yellow.opacity_80,
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
    if (regional_traffics?.length > 0) {
      var markers = [];
      for (let regional_traffic of regional_traffics) {
        const countryData = CountryData[regional_traffic.key.toUpperCase()];
        // if (!countryData) {
        //     console.log(regional_traffic.key);
        // }
        markers.push({
          latLng: [countryData?.x, countryData?.y],
          name: countryData?.country,
          value: regional_traffic.doc_count,
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
            fill: theme.palette.custom.yellow.opacity_80,
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
            fill: theme.palette.custom.yellow.opacity_80,
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
  }, [regional_traffics]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardContent style={{ backgroundColor: "white" }}>
        <MapContainer>
          {regional_traffics === null ? (
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
        </MapContainer>
      </CardContent>
    </Card>
  );
}

export default withTheme(WorldMap);
