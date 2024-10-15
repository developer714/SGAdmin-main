import { LicenseLevel, LicenseLevelString } from "../../../../../utils/constants";

function getLicenseLevelString(plan) {
  switch (plan) {
    case LicenseLevel.COMMUNITY:
      return LicenseLevelString.COMMUNITY;
    case LicenseLevel.PROFESSIONAL:
      return LicenseLevelString.PROFESSIONAL;
    case LicenseLevel.BUSINESS:
      return LicenseLevelString.BUSINESS;
    case LicenseLevel.ENTERPRISE:
      return LicenseLevelString.ENTERPRISE;
    default:
      return `Unknown ${plan}`;
  }
}

export { getLicenseLevelString };
