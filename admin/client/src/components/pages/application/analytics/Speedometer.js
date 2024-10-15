import React from "react";
import { makeStyles } from "@mui/styles";

import TrackImg from "../../../../vendor/analytics/track.svg";
import NeedleImg from "../../../../vendor/analytics/needle.svg";
import { Box, Typography } from "@mui/material";

const useStyles = makeStyles({
  root: {
    position: "relative",
    width: "186px",
    height: "108px",
    backgroundImage: `url('${TrackImg}')`,
    backgroundSize: "cover",
  },
  needleContainer: {
    position: "absolute",
    top: "100%",
    left: "50%",
    transformOrigin: "center center",
    // transform: "translate(-50%, -50%)",
    transition: "transform 0.5s ease",
  },
  needle: {
    position: "absolute",
    top: "0",
    left: "90px",
    transform: "translate(-50%, -50%)",
    transformOrigin: "center center",
  },
  label: {
    position: "absolute",
    top: "70px",
    left: "93px",
    transform: "translate(-50%, -50%)",
  },
});

const Speedometer = ({ value }) => {
  const classes = useStyles();
  // Replace the SVG string above with your own track image data

  const angleRad = ((value * 1.8 - 180) / 180) * Math.PI;
  const length = Math.hypot(90 * Math.cos(angleRad), 108 * Math.sin(angleRad));

  const needleContainerStyle = {
    transform: `rotate(${(value * 1.8 - 180) % 360}deg)`,
  };
  const needleStyle = {
    left: `${length}px`,
    // transform: `rotate(${-(speed * 1.8 - 90)}deg)`,
    transform: `rotate(${15}deg) translate(-50%, -50%)`,
  };

  return (
    <Box mt={2}>
      <div className={classes.root}>
        <div className={classes.needleContainer} style={needleContainerStyle}>
          <img src={NeedleImg} alt="needle" className={classes.needle} style={needleStyle} />
        </div>
        <Typography className={classes.label} variant="h2" sx={{ fontSize: "3rem" }}>
          {value}
        </Typography>
      </div>
    </Box>
  );
};

export default Speedometer;
