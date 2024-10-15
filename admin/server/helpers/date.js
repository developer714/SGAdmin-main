const getHumanTimeLength = (d) => {
  d = Number(d);
  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);

  let sResult = "";
  let hDisplay = h > 0 ? h + (h === 1 ? " hour" : " hours") : "";
  sResult += hDisplay;
  let mDisplay = m > 0 ? m + (m === 1 ? " minute" : " minutes") : "";
  if (0 < mDisplay.length) {
    if (0 < sResult.length) sResult += ", ";
    sResult += mDisplay;
  }
  let sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  if (0 < sDisplay.length) {
    if (0 < sResult.length) sResult += ", ";
    sResult += sDisplay;
  }
  return sResult;
};

module.exports = { getHumanTimeLength };
