import React from "react";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { Zap, Settings } from "react-feather";
import { Home as HomeIcon, Language as MuiLanguageIcon } from "@mui/icons-material";
import MuiProfileIcon from "@mui/icons-material/AccountCircleOutlined";

import useSite from "../../hooks/user/useSite";
import useAuth from "../../hooks/useAuth";

import { FeatureId } from "../../utils/constants";

// Sidebar icons
import { ReactComponent as SslSvg } from "../../vendor/sidebar/ssl.svg";
import { ReactComponent as FwSvg } from "../../vendor/sidebar/firewall.svg";
import { ReactComponent as RlSvg } from "../../vendor/sidebar/ratelimit.svg";
import { ReactComponent as DdosSvg } from "../../vendor/sidebar/ddos.svg";
import { ReactComponent as BotSvg } from "../../vendor/sidebar/bot.svg";
import { ReactComponent as AuthSvg } from "../../vendor/sidebar/auth.svg";
import { ReactComponent as Analytics } from "../../vendor/sidebar/analytics.svg";
import { ReactComponent as AppsSvg } from "../../vendor/application.svg";

const LanguageIcon = styled(MuiLanguageIcon)`
  width: 24px;
  height: 24px;
`;
const ZapIcon = styled(Zap)`
  width: 24px;
  height: 24px;
`;
const SslIcon = styled(SslSvg)`
  width: 24px;
  height: 24px;
`;
const FwIcon = styled(FwSvg)`
  width: 24px;
  height: 24px;
`;
const RlIcon = styled(RlSvg)`
  width: 24px;
  height: 24px;
`;
const DdosIcon = styled(DdosSvg)`
  width: 24px;
  height: 24px;
`;
const BotIcon = styled(BotSvg)`
  width: 24px;
  height: 24px;
`;
const AuthIcon = styled(AuthSvg)`
  width: 24px;
  height: 24px;
`;
const AnalyticsIcon = styled(Analytics)`
  width: 24px;
  height: 24px;
`;
const SettingsIcon = styled(Settings)`
  width: 24px;
  height: 24px;
`;
const ProfileIcon = styled(MuiProfileIcon)`
  width: 24px;
  height: 24px;
`;
const AppsIcon = styled(AppsSvg)`
  width: 24px;
  height: 24px;
`;

function Items() {
  const { configSite } = useParams();
  const { isAuthenticated, isFeatureEnabled, getFeatureValue } = useAuth();
  const { siteList, getSitesForItems } = useSite();

  const orgName = window.localStorage.getItem("OrgName");
  const orgAdmin = window.localStorage.getItem("OrgAdmin");

  React.useEffect(() => {
    if (isAuthenticated) {
      getSitesForItems();
    }
  }, [isAuthenticated, getSitesForItems]);
  React.useEffect(() => {
    if (isAuthenticated && siteList === null) {
      getSitesForItems();
    }
  }, [isAuthenticated, siteList, getSitesForItems]);
  const HomeNavbar = {
    href: "/home",
    icon: HomeIcon,
    title: "Home",
  };
  const ApplicationNavbar = {
    href: "/application",
    icon: AppsIcon,
    title: "Application",
  };
  const NavbarSection = [[HomeNavbar], [ApplicationNavbar]];

  var SidebarSectionOA = [];
  var SidebarSectionNU = [];

  const ProfileSection = {
    href: "/application/profile",
    icon: ProfileIcon,
    title: "Profile",
    children: [
      {
        href: "/application/profile/personal",
        title: "My Profile",
      },
      {
        href: "/application/profile/key",
        title: "API Keys",
      },
      {
        href: "/application/profile/payment",
        title: "Payment Method",
      },
    ],
  };

  if (siteList === null || siteList?.length === 0) {
    // Sidebar Section
    const WebsiteSection = {
      href: "/application/sites",
      icon: LanguageIcon,
      title: "Websites",
    };
    const AdministrationSection = !(isFeatureEnabled(FeatureId.TEAM_MANAGEMENT) && isFeatureEnabled(FeatureId.ROLE_BASED_ACCESS_CONTROL))
      ? {
          href: "/application",
          icon: SettingsIcon,
          title: "Administration",
          children: [
            {
              href: "/application/admin/log",
              title: "Audit Log",
            },
            {
              href: "/application/admin/plan",
              title: "Plan Summary",
            },
          ],
        }
      : {
          href: "/application",
          icon: SettingsIcon,
          title: "Administration",
          children: [
            {
              href: "/application/admin/log",
              title: "Audit Log",
            },
            {
              href: "/application/admin/account",
              title: "Account",
            },
            {
              href: "/application/admin/plan",
              title: "Plan Summary",
            },
          ],
        };
    const AdministrationSection_ = {
      href: "/application",
      icon: SettingsIcon,
      title: "Administration",
      children: [
        {
          href: "/application/admin/log",
          title: "Audit Log",
        },
      ],
    };
    if (orgName && orgAdmin) {
      SidebarSectionOA = [WebsiteSection, AdministrationSection];
      SidebarSectionNU = [WebsiteSection, AdministrationSection_];
    } else {
      SidebarSectionOA = [WebsiteSection, AdministrationSection, ProfileSection];
      SidebarSectionNU = [WebsiteSection, AdministrationSection_, ProfileSection];
    }
  } else {
    const siteUid = configSite ? configSite : "all";
    const WAFSection = {
      href: "/application",
      icon: ZapIcon,
      title: "Web Application Firewall",
      children: [
        {
          href: `/application/${siteUid}/waf/dashboard`,
          title: "Dashboard",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/waf/config` : `/application/${siteUid}/waf/config`,
          title: "Configuration",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/waf/exception` : `/application/${siteUid}/waf/exception`,
          title: "Exception",
        },
        {
          href: "/application/waf/rule/custom",
          title: "Custom Rules",
        },
      ],
    };

    // Navbar Section

    // Sidebar Section
    const WebsiteSection = {
      href: "/application/sites",
      icon: LanguageIcon,
      title: "Websites",
    };
    const SSLSection = {
      href: siteUid === "all" ? `/application/${siteList[0]?.id}/ssl` : `/application/${siteUid}/ssl`,
      icon: SslIcon,
      title: "SSL",
    };
    const FirewallSection = {
      href: siteUid === "all" ? `/application/${siteList[0]?.id}/firewall` : `/application/${siteUid}/firewall`,
      icon: FwIcon,
      title: "Firewall",
    };
    const RateLimitSection = {
      href: siteUid === "all" ? `/application/${siteList[0]?.id}/ratelimit` : `/application/${siteUid}/ratelimit`,
      icon: RlIcon,
      title: "Rate Limiting",
    };

    const DdosSection = {
      href: siteUid === "all" ? `/application/${siteList[0]?.id}/ddos/config` : `/application/${siteUid}/ddos/config`,
      icon: DdosIcon,
      title: "DDoS Mitigation",
    };

    const BMSection = {
      href: "/application",
      icon: BotIcon,
      title: "Bot Management",
      children: [
        {
          href: `/application/${siteUid}/bot/dashboard`,
          title: "Dashboard",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/bot/config` : `/application/${siteUid}/bot/config`,
          title: "Configuration",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/bot/exception` : `/application/${siteUid}/bot/exception`,
          title: "Exception",
        },
      ],
    };

    const AUSection = {
      href: "/application",
      icon: AuthIcon,
      title: "Auth Management",
      children: [
        {
          href: `/application/${siteUid}/auth/dashboard`,
          title: "Dashboard",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/auth/config` : `/application/${siteUid}/auth/config`,
          title: "Configuration",
        },
        {
          href: siteUid === "all" ? `/application/${siteList[0]?.id}/auth/exception` : `/application/${siteUid}/auth/exception`,
          title: "Exception",
        },
      ],
    };


    const AnalyticsSection = {
      href: "/application",
      icon: AnalyticsIcon,
      title: "Analytics",
      children: [
        {
          href: "/application/analytics/events",
          title: "WAF Event",
        },
        {
          href: "/application/analytics/bot_events",
          title: "Bot Event",
        },
        {
          href: "/application/analytics/auth_events",
          title: "Auth Event",
        },
        {
          href: "/application/analytics/rl_events",
          title: "Rate Limit Event",
        },
      ],
    };
    const AdministrationSection = {
      href: "/application",
      icon: SettingsIcon,
      title: "Administration",
      children: [
        {
          href: "/application/admin/webhook",
          title: "External Webhook",
        },
        {
          href: "/application/admin/log",
          title: "Audit Log",
        },
      ],
    };
    if (isFeatureEnabled(FeatureId.TEAM_MANAGEMENT) && isFeatureEnabled(FeatureId.ROLE_BASED_ACCESS_CONTROL)) {
      AdministrationSection.children.push({
        href: "/application/admin/account",
        title: "Account",
      });
    }
    if (isFeatureEnabled(FeatureId.B2B_SAML)) {
      AdministrationSection.children.push({
        href: "/application/admin/saml",
        title: "SSO Integration",
      });
    }
    AdministrationSection.children.push({
      href: "/application/admin/plan",
      title: "Plan Summary",
    });

    const AdministrationSection_ = {
      href: "/application",
      icon: SettingsIcon,
      title: "Administration",
      children: [
        {
          href: "/application/admin/webhook",
          title: "External Webhook",
        },
        {
          href: "/application/admin/log",
          title: "Audit Log",
        },
      ],
    };
    if (orgName && orgAdmin) {
      SidebarSectionOA = [WebsiteSection, WAFSection, SSLSection, FirewallSection];
      SidebarSectionNU = [WebsiteSection, WAFSection, SSLSection, FirewallSection];
      if (0 < getFeatureValue(FeatureId.RATE_LIMIT_RULE)) {
        SidebarSectionOA.push(RateLimitSection);
        SidebarSectionNU.push(RateLimitSection);
      }
      SidebarSectionOA.push(DdosSection);
      if (0 < getFeatureValue(FeatureId.BOT_MANAGEMENT)) {
        SidebarSectionOA.push(BMSection);
        SidebarSectionNU.push(BMSection);
      }
      if (0 < getFeatureValue(FeatureId.AUTH_MANAGEMENT)) {
        SidebarSectionOA.push(AUSection);
        SidebarSectionNU.push(AUSection);
      }
      SidebarSectionOA = [...SidebarSectionOA, AnalyticsSection, AdministrationSection];
      SidebarSectionNU = [...SidebarSectionNU, AnalyticsSection, AdministrationSection_];
    } else {
      SidebarSectionOA = [WebsiteSection, WAFSection, SSLSection, FirewallSection];
      SidebarSectionNU = [WebsiteSection, WAFSection, SSLSection, FirewallSection];
      if (0 < getFeatureValue(FeatureId.RATE_LIMIT_RULE)) {
        SidebarSectionOA.push(RateLimitSection);
        SidebarSectionNU.push(RateLimitSection);
      }
      SidebarSectionOA.push(DdosSection);
      if (0 < getFeatureValue(FeatureId.BOT_MANAGEMENT)) {
        SidebarSectionOA.push(BMSection);
        SidebarSectionNU.push(BMSection);
      }
      if (0 < getFeatureValue(FeatureId.AUTH_MANAGEMENT)) {
        SidebarSectionOA.push(AUSection);
        SidebarSectionNU.push(AUSection);
      }
      SidebarSectionOA = [...SidebarSectionOA, AnalyticsSection, AdministrationSection, ProfileSection];
      SidebarSectionNU = [...SidebarSectionNU, AnalyticsSection, AdministrationSection_, ProfileSection];
    }
  }

  return {
    SidebarSectionOA,
    SidebarSectionNU,
    NavbarSection,
  };
}
export default Items;
