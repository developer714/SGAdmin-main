import React from "react";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { Settings, User, Shield, Zap, Lock } from "react-feather";
// import { Settings, User, Shield, Zap, Database } from "react-feather";
// import { Apps as AppsIcon, Home as HomeIcon } from "@mui/icons-material";
import { Apps as AppsIcon } from "@mui/icons-material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ProfileIcon from "@mui/icons-material/AccountCircleOutlined";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SecurityIcon from "@mui/icons-material/Security";
import ContactsIcon from "@mui/icons-material/Contacts";
import PublicIcon from "@mui/icons-material/Public";

import { ReactComponent as Organisation } from "../../vendor/organisation.svg";
import { ReactComponent as Elastic } from "../../vendor/elastic.svg";

import useUser from "../../hooks/super/useUser";
import useAuth from "../../hooks/useAuth";

function Items() {
  const { orgID } = useParams();
  const { isAuthenticated } = useAuth();
  const { organisations, getOrganisations, setCurOrgID } = useUser();

  React.useEffect(() => {
    if (isAuthenticated) {
      getOrganisations();
      setCurOrgID(orgID);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (isAuthenticated && organisations === null) {
      getOrganisations();
    }
  }, [organisations]); // eslint-disable-line react-hooks/exhaustive-deps

  const OrganisationIcon = styled(Organisation)`
    padding: 0px;
    width: 24px;
    height: 24px;
  `;
  const ElasticIcon = styled(Elastic)`
    padding: 0px;
    width: 24px;
    height: 24px;
  `;
  // const HomeNavbar = {
  //     href: "/super/home",
  //     icon: HomeIcon,
  //     title: "Home",
  // };
  const ApplicationNavbar = {
    href: "/super/application",
    icon: AppsIcon,
    title: "Application",
  };
  // const NavbarSection = [[HomeNavbar], [ApplicationNavbar]];
  const NavbarSection = [[ApplicationNavbar]];

  var SidebarSection = [];

  const OrganisationSection = {
    href: "/super/application/organisation",
    icon: OrganisationIcon,
    title: "Organisation",
  };

  const WAFEdgeSection = {
    href: "/super/application/waf_edge",
    icon: Zap,
    title: "WAF Engines & Edges",
    children: [
      {
        href: "/super/application/omb_service/list",
        title: "OMB Service List",
      },
      {
        href: "/super/application/waf_engine/list",
        title: "WAF Engine List",
      },
      {
        href: "/super/application/rl_engine/list",
        title: "RL Engine List",
      },
      {
        href: "/super/application/bm_engine/list",
        title: "BM Engine List",
      },
      {
        href: "/super/application/au_engine/list",
        title: "AU Engine List",
      },
      {
        href: "/super/application/ad_engine/list",
        title: "AD Engine List",
      },
      {
        href: "/super/application/es_engine/list",
        title: "ES Engine List",
      },
      {
        href: "/super/application/waf_edge/config",
        title: "Engines Configuration",
      },
    ],
  };

  const MonitorHealthSection = {
    href: "/super/application",
    icon: MonitorHeartOutlinedIcon,
    title: "Monitor WAF Health",
    children: [
      {
        href: "/super/application/monitor/dashboard",
        title: "Dashboard Health",
      },
      {
        href: "/super/application/monitor/omb_service",
        title: "OMB Service Health",
      },
      {
        href: "/super/application/monitor/waf_engine",
        title: "WAF Engine Health",
      },
      {
        href: "/super/application/monitor/rl_engine",
        title: "RL Engine Health",
      },
      {
        href: "/super/application/monitor/bm_engine",
        title: "BM Engine Health",
      },
      {
        href: "/super/application/monitor/au_engine",
        title: "AU Engine Health",
      },
      {
        href: "/super/application/monitor/ad_engine",
        title: "AD Engine Health",
      },
      {
        href: "/super/application/monitor/es_engine",
        title: "ES Engine Health",
      },
    ],
  };
  const MonitorStatsSection = {
    href: "/super/application",
    icon: MonitorHeartOutlinedIcon,
    title: "Monitor WAF Stats",
    children: [
      {
        href: "/super/application/stats/omb_service_real",
        title: "OMB Service Real Time Stats",
      },
      {
        href: "/super/application/stats/waf_engine_real",
        title: "WAF Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/waf_engine_past",
        title: "WAF Engine Past Stats",
      },
      {
        href: "/super/application/stats/rl_engine_real",
        title: "RL Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/rl_engine_past",
        title: "RL Engine Past Stats",
      },
      {
        href: "/super/application/stats/bm_engine_real",
        title: "BM Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/bm_engine_past",
        title: "BM Engine Past Stats",
      },
      {
        href: "/super/application/stats/au_engine_real",
        title: "AU Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/au_engine_past",
        title: "AU Engine Past Stats",
      },
      {
        href: "/super/application/stats/ad_engine_real",
        title: "AD Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/es_engine_real",
        title: "ES Engine Real Time Stats",
      },
      {
        href: "/super/application/stats/es_engine_past",
        title: "ES Engine Past Stats",
      },
    ],
  };

  const RegionSection = {
    href: "/super/application/region/list",
    icon: PublicIcon,
    title: "WAF Regions",
  };

  const PaymentSection = {
    href: "/super/application",
    icon: ShoppingCartOutlinedIcon,
    title: "Payment",
    children: [
      {
        href: "/super/application/payment/feature",
        title: "Feature Management",
      },
      // {
      //   href: "/super/application/payment/common",
      //   title: "Common Package",
      // },
      {
        href: "/super/application/payment/custom",
        title: "Custom Package",
      },
      {
        href: "/super/application/payment/stripe_config",
        title: "Stripe Configuration",
      },
      {
        href: "/super/application/payment/rate_limit_bill_config",
        title: "Rate Limit Billing Configuration",
      },
      {
        href: "/super/application/payment/history",
        title: "Payment History",
      },
      {
        href: "/super/application/license_status/custom",
        title: "License Statuses",
      },
    ],
  };
  const ZcrmSection = {
    href: "/super/application",
    icon: ContactsIcon,
    title: "Zoho CRM",
    children: [
      {
        href: "/super/application/zcrm/api_config",
        title: "API Configuration",
      },
      {
        href: "/super/application/zcrm/product",
        title: "Product Management",
      },
      {
        href: "/super/application/zcrm/account_contact",
        title: "Account & Contact Management",
      },
      {
        href: "/super/application/zcrm/quote",
        title: "Create Quote",
      },
    ],
  };
  const BotManagementSection = {
    href: "/super/application",
    icon: EngineeringIcon,
    title: "Bot Management",
    children: [
      {
        href: "/super/application/bm/aws_s3",
        title: "AWS S3 Configuration",
      },
      /*
            {
                href: "/super/application/bm/license",
                title: "License Status",
            },
            {
                href: "/super/application/bm/package",
                title: "Package",
            },
            {
                href: "/super/application/bm/payment",
                title: "Payment",
            },
            */
    ],
  };
  const AuthManagementSection = {
    href: "/super/application/au",
    icon: EngineeringIcon,
    title: "Auth Management",
    children: [
      {
        href: "/super/application/au/aws_s3",
        title: "Auth_AWS S3 Configuration",
      },
    ],
  };
  const AntiDdosSection = {
    href: "/super/application",
    icon: SecurityIcon,
    title: "Anti DDoS",
    children: [
      {
        href: "/super/application/ad/config",
        title: "Anti DDoS Configuration",
      },
      {
        href: "/super/application/ad/exception",
        title: "Anti DDoS Exception",
      },
    ],
  };
  const RuleSection = {
    href: "/super/application",
    icon: RuleOutlinedIcon,
    title: "Rule",
    children: [
      {
        href: "/super/application/rule/owasp",
        title: "OWASP Rules",
      },
      {
        href: "/super/application/rule/ml",
        title: "ML Rules",
      },
      {
        href: "/super/application/rule/sd",
        title: "Sense Defence Rules",
      },
      {
        href: "/super/application/rule/custom",
        title: "Custom Rules",
      },
    ],
  };
  const SSLSection = {
    href: "/super/application/ssl",
    icon: Shield,
    title: "SSL",
  };
  const CaptchaSection = {
    href: "/super/application",
    icon: Lock,
    title: "Captcha",
    children: [
      {
        href: "/super/application/captcha/general",
        title: "General Settings",
      },
      {
        href: "/super/application/captcha/api_keys",
        title: "API Keys",
      },
      {
        href: "/super/application/captcha/block_pages",
        title: "Block Pages",
      },
    ],
  };
  const ApiKeySection = {
    href: "/super/application",
    icon: Settings,
    title: "API Keys",
    children: [
      {
        href: "/super/application/apikey/otx",
        title: "OTX",
      },
      {
        href: "/super/application/apikey/abuseipdb",
        title: "AbuseIPDB",
      },
    ],
  };
  const ElasticSection = {
    href: "/super/application",
    icon: ElasticIcon,
    title: "Elastic Search",
    children: [
      {
        href: "/super/application/elastic/cloud",
        title: "ES Cloud",
      },
      {
        href: "/super/application/elastic/private",
        title: "Private ES",
      },
      {
        href: "/super/application/elastic/api_console",
        title: "API Console",
      },
    ],
  };
  const AuditLogSection = {
    href: "/super/application/log",
    icon: EventNoteOutlinedIcon,
    title: "Audit Log",
  };
  const ProfileSection = {
    href: "/super/application/profile",
    icon: ProfileIcon,
    title: "Profile",
  };
  const GeneralSection = {
    href: "/super/application",
    icon: Settings,
    title: "General",
    children: [
      {
        href: "/super/application/general/email",
        title: "Email",
      },
      {
        href: "/super/application/general/invoice",
        title: "Invoice",
      },
      {
        href: "/super/application/general/notification",
        title: "Notification",
      },
    ],
  };

  if (organisations === null || organisations?.length === 0) {
    SidebarSection = [
      OrganisationSection,
      WAFEdgeSection,
      MonitorHealthSection,
      MonitorStatsSection,
      RegionSection,
      RuleSection,
      SSLSection,
      CaptchaSection,
      ApiKeySection,
      ElasticSection,
      GeneralSection,
      AuditLogSection,
      ProfileSection,
    ];
  } else {
    const organisationID = orgID ? orgID : organisations[0]?.id;
    const UserSection = {
      href: "/super/application",
      icon: User,
      title: "User",
      children: [
        {
          href: "/super/application/admins/list",
          title: "Administrators",
        },
        {
          href: "/super/application/user/list/" + organisationID,
          title: "User List",
        },
        {
          href: "/super/application/user/report",
          title: "User Report",
        },
      ],
    };
    SidebarSection = [
      OrganisationSection,
      UserSection,
      WAFEdgeSection,
      MonitorHealthSection,
      MonitorStatsSection,
      RegionSection,
      RuleSection,
      SSLSection,
      CaptchaSection,
      ApiKeySection,
      ElasticSection,
      GeneralSection,
      PaymentSection,
      ZcrmSection,
      BotManagementSection,
      AuthManagementSection,
      AntiDdosSection,
      AuditLogSection,
      ProfileSection,
    ];
  }

  return { SidebarSection, NavbarSection };
}

export default Items;
