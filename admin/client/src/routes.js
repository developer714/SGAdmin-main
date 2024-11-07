import React from "react";
// Layouts
import AuthLayout from "./layouts/Auth";
import PresentationLayout from "./layouts/Presentation";
import NormalLayout from "./layouts/Normal";
import SALayout from "./layouts/SALayout";

// Guards
import AuthGuard from "./components/guards/AuthGuard";
import SuperGuard from "./components/guards/SuperGuard";

// Contexts
import { HomeProvider } from "./contexts/user/HomeContext";
import { AdminProvider } from "./contexts/user/AdminContext";
import { EventProvider } from "./contexts/user/EventContext";
import { WAFRuleProvider } from "./contexts/user/WAFConfigContext";
import { BMConfigProvider } from "./contexts/user/BMConfigContext";
import { AUConfigProvider } from "./contexts/user/AUConfigContext.js";
import { DdosConfigProvider } from "./contexts/user/DdosConfigContext";
import { SiteProvider } from "./contexts/user/SiteContext";
import { SslConfigProvider } from "./contexts/user/SSLConfigContext";
import { FirewallProvider } from "./contexts/user/FirewallContext";
import { RateLimitProvider } from "./contexts/user/RateLimitContext";
import { PaywallProvider } from "./contexts/user/PaywallContext";
import { KeyProvider } from "./contexts/user/KeyContext";

import { GeneralProvider } from "./contexts/super/GeneralContext";
import { LogProvider } from "./contexts/super/LogContext";
import { OrganisationProvider } from "./contexts/super/OrganisationContext";
import { UserProvider } from "./contexts/super/UserContext";
import { WAFProvider } from "./contexts/super/nodes/WAFContext";
import { WAFEdgeProvider } from "./contexts/super/nodes/WAFEdgeContext";
import { BmEngineProvider } from "./contexts/super/nodes/BmEngineContext";
import { AuEngineProvider } from "./contexts/super/nodes/AuEngineContext";
import { EsEngineProvider } from "./contexts/super/nodes/EsEngineContext";
import { AdEngineProvider } from "./contexts/super/nodes/AdEngineContext";
import { OmbServiceProvider } from "./contexts/super/nodes/OmbServiceContext";
import { MonitorProvider } from "./contexts/super/monitor_nodes/MonitorContext";
import { MonitorOmbServiceProvider } from "./contexts/super/monitor_nodes/MonitorOmbServiceContext";
import { MonitorEdgeProvider } from "./contexts/super/monitor_nodes/MonitorEdgeContext";
import { MonitorBmEngineProvider } from "./contexts/super/monitor_nodes/MonitorBmEngineContext";
import { MonitorAuEngineProvider } from "./contexts/super/monitor_nodes/MonitorAuEngineContex.js";
import { MonitorAdEngineProvider } from "./contexts/super/monitor_nodes/MonitorAdEngineContext";
import { MonitorEsEngineProvider } from "./contexts/super/monitor_nodes/MonitorEsEngineContext";
import { RegionProvider } from "./contexts/super/RegionContext";
import { ElasticProvider } from "./contexts/super/ElasticContext";
import { SSLProvider } from "./contexts/super/SSLContext";
import { ApiKeyProvider } from "./contexts/super/ApiKeyContext";
import { CaptchaProvider } from "./contexts/super/CaptchaContext";
import { RuleProvider } from "./contexts/super/RuleContext";
import { PaymentProvider } from "./contexts/super/PaymentContext";
import { ZcrmProvider } from "./contexts/super/ZcrmContext";
import { BMProvider } from "./contexts/super/BMContext";
import { AUProvider } from "./contexts/super/AUContext";
import { ADProvider } from "./contexts/super/ADContext";
import { AdExceptionProvider } from "./contexts/super/ADExceptionContext";
// Landing
import Landing from "./pages/landing";
// Auth components
/*
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import SignOut from "./pages/auth/SignOut";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
*/
import VerifyEmail from "./pages/auth/VerifyEmail";
import Page404 from "./pages/error/Page404";
import Page500 from "./pages/error/Page500";

// Home
import Home from "./pages/home";
// Application
import Application from "./pages/application";
import Websites from "./pages/application/sites.js";
import NewWebsite from "./pages/application/newSite.js";
import SSLOverview from "./pages/application/ssl/overview";
import SSLConfig from "./pages/application/ssl/config";
import Firewall from "./pages/application/firewall";
import NewFirewall from "./pages/application/firewall/new";
import EditFirewall from "./pages/application/firewall/edit";
import RateLimit from "./pages/application/ratelimit";
import NewRateLimit from "./pages/application/ratelimit/new";
import EditRateLimit from "./pages/application/ratelimit/edit";
import NewCustomBlockPage from "./pages/application/waf/newCustomBlockPage";

// application/waf
import WAFDashboard from "./pages/application/waf/dashboard";
import WAFConfig from "./pages/application/waf/config";
import WAFCustomBlockPage from "./pages/application/waf/customBlockPage";
import WAFRule from "./pages/application/waf/rule";
import WAFSdSigRule from "./pages/application/waf/sd_sig_rule";
import WAFException from "./pages/application/waf/exception";
import NewWAFExcption from "./pages/application/waf/newException";
import EditWAFExcption from "./pages/application/waf/editException";
import CustomRule from "./pages/application/waf/rule/custom";
import NewCustomRule from "./pages/application/waf/rule/custom/new";
import EditCustomRule from "./pages/application/waf/rule/custom/edit";

// application/bot
import BMConfig from "./pages/application/bot/config";
import BMException from "./pages/application/bot/exception";
import NewBotException from "./pages/application/bot/newException";
import EditBotException from "./pages/application/bot/editException";


// application/auth
import AUConfig from "./pages/application/auth/config";
import AUException from "./pages/application/auth/exception";
import NewAuthException from "./pages/application/auth/newException";
import EditAuthException from "./pages/application/auth/editException";

// application/ddos
import DdosConfig from "./pages/application/ddos/config";

// application/admin
import Log from "./pages/application/admin/log";
import Webhook from "./pages/application/admin/webhook";
import Users from "./pages/application/admin/users";
import SAMLConfig from "./pages/application/admin/saml";
import Paywall from "./pages/application/admin/paywall";
import PlanSummary from "./pages/application/admin/plan";

// application/analytics
import AnalyticsEvents from "./pages/application/analytics/events";
import AnalyticsEventsDetail from "./pages/application/analytics/detail";

import AnalyticsBotEvents from "./pages/application/analytics/bot_events";
import AnalyticsBotEventsDetail from "./pages/application/analytics/bot_detail";

import AnalyticsAuthEvents from "./pages/application/analytics/auth_events";
import AnalyticsAuthEventsDetail from "./pages/application/analytics/auth_detail";

import AnalyticsRLEvents from "./pages/application/analytics/rl_events";
import AnalyticsRLEventsDetail from "./pages/application/analytics/rl_detail";

// profile
import PersonalProfile from "./pages/application/profile/personal.js";
import PaymentProfile from "./pages/application/profile/payment.js";

// Super Admin
import SADataRetention from "./pages/super/dataRetention";
import SAElasticCloud from "./pages/super/elastic/cloud";
import SAPrivateElastic from "./pages/super/elastic/private";
import SAEsApiConsole from "./pages/super/elastic/api_console";
import SAEmailConfiguration from "./pages/super/general/email";
import SAInvoiceConfiguration from "./pages/super/general/invoice";
import SANotificationConfiguration from "./pages/super/general/notification";
import SALog from "./pages/super/log";
import SAWAFDashboardHealth from "./pages/super/monitor/dashboard";
import SAWAFEdgeHealth from "./pages/super/monitor/edge";
import SAOrganisation from "./pages/super/organisation";
import SAStripeConfig from "./pages/super/payment/stripe";
import SAZcrmApiConfig from "./pages/super/zcrm/api_config";
import SAZcrmProduct from "./pages/super/zcrm/product";
import SAZcrmAccountContact from "./pages/super/zcrm/account_contact";
import SAZcrmQuote from "./pages/super/zcrm/quote";
import SARateLimitBillConfig from "./pages/super/payment/rateLimitBill";
// import SAPaymentHistoryOriginal from "./pages/super/payment/historyOriginal";
import SAPaymentHistoryCustom from "./pages/super/payment/historyCustom";
/*
import SABMPayment from "./pages/super/bm/payment";
import SABmLicenseUsage from "./pages/super/bm/license_usage";
import SABMPackage from "./pages/super/bm/package";
*/
import SAAwsS3Cfgs from "./pages/super/bm/aws_s3";
import AU_SAAwsS3Cfgs from "./pages/super/au/au_aws_s3.js";
import SAAdCfgs from "./pages/super/ad/config";
import SAAdException from "./pages/super/ad/exception";
import SAPaymentCommonPackage from "./pages/super/payment/common";
import SAPaymentCommonHistory from "./pages/super/payment/commonHistory";
import SAPaymentCustomPackage from "./pages/super/payment/custom";
import SACustomLicenseStatus from "./pages/super/payment/customLicenseStatus";
import SAOwaspRule from "./pages/super/rule/owasp";
import SAMlRule from "./pages/super/rule/ml";
import SASdRule from "./pages/super/rule/sd";
import SACustomRule from "./pages/super/rule/custom/index";
import SANewCustomRule from "./pages/super/rule/custom/new";
import SAEditCustomRule from "./pages/super/rule/custom/edit";
import SASSL from "./pages/super/ssl";
import SAOtxApiKey from "./pages/super/apikey/otx";
import SAAbuseIpDbApiKey from "./pages/super/apikey/abuseipdb";
import SACaptchaGeneral from "./pages/super/captcha/general";
import SACaptchaApiKeys from "./pages/super/captcha/api_keys";
import SACaptchaBlockPage from "./pages/super/captcha/block_pages";
import SAAdmins from "./pages/super/user/admins";
import SAUser from "./pages/super/user";
import SAUserReport from "./pages/super/user/report";
import SAWAFList from "./pages/super/waf";
import SARegionList from "./pages/super/region";
import SAWAFConfig from "./pages/super/waf/config";
import SAHome from "./pages/super";
import SAApplication from "./pages/super/application";
import SAWAFEdgeStatsReal from "./pages/super/monitor/edgeStatsReal";
import SAWAFEdgeStatsHistory from "./pages/super/monitor/edgeStatsHistory";
import SAPaymentFeature from "./pages/super/payment/feature";
import SAProfile from "./pages/super/profile";
import { WafNodeType } from "./utils/constants";
import BMDashboard from "./pages/application/bot/dashboard";
import AUDashboard from "./pages/application/auth/dashboard";
import { IdPProvider } from "./contexts/user/IdPContext";
import AgreePolicy from "./pages/auth/AgreePolicy";
import LogIn from "./pages/auth/LogIn";
import Page403 from "./pages/error/Page403";
import PersonalAPIKey from "./pages/application/profile/key";

const routes = [
  {
    path: "super/application",
    element: (
      <SuperGuard>
        <UserProvider>
          <SALayout />
        </UserProvider>
      </SuperGuard>
    ),
    children: [
      {
        path: "",
        element: <SAApplication />,
      },
      {
        path: "data_retention",
        element: <SADataRetention />,
      },
      {
        path: "elastic/cloud",
        element: (
          <ElasticProvider>
            <SAElasticCloud />
          </ElasticProvider>
        ),
      },
      {
        path: "elastic/private",
        element: (
          <ElasticProvider>
            <SAPrivateElastic />
          </ElasticProvider>
        ),
      },
      {
        path: "elastic/api_console",
        element: (
          <ElasticProvider>
            <SAEsApiConsole />
          </ElasticProvider>
        ),
      },
      {
        path: "general/email",
        element: (
          <GeneralProvider>
            <SAEmailConfiguration />
          </GeneralProvider>
        ),
      },
      {
        path: "general/invoice",
        element: (
          <GeneralProvider>
            <SAInvoiceConfiguration />
          </GeneralProvider>
        ),
      },
      {
        path: "general/notification",
        element: (
          <GeneralProvider>
            <SANotificationConfiguration />
          </GeneralProvider>
        ),
      },
      {
        path: "log",
        element: (
          <LogProvider>
            <SALog />
          </LogProvider>
        ),
      },
      {
        path: "monitor/dashboard",
        element: (
          <MonitorProvider>
            <SAWAFDashboardHealth />
          </MonitorProvider>
        ),
      },
      {
        path: "monitor/omb_service",
        element: (
          <MonitorOmbServiceProvider>
            <SAWAFEdgeHealth type={WafNodeType.OMB_SERVICE} />
          </MonitorOmbServiceProvider>
        ),
      },
      {
        path: "monitor/waf_engine",
        element: (
          <MonitorProvider>
            <SAWAFEdgeHealth type={WafNodeType.WAF_ENGINE} />
          </MonitorProvider>
        ),
      },
      {
        path: "monitor/rl_engine",
        element: (
          <MonitorEdgeProvider>
            <SAWAFEdgeHealth type={WafNodeType.RL_ENGINE} />
          </MonitorEdgeProvider>
        ),
      },
      {
        path: "monitor/bm_engine",
        element: (
          <MonitorBmEngineProvider>
            <SAWAFEdgeHealth type={WafNodeType.BM_ENGINE} />
          </MonitorBmEngineProvider>
        ),
      },
      {
        path: "monitor/au_engine",
        element: (
          <MonitorAuEngineProvider>
            <SAWAFEdgeHealth type={WafNodeType.AU_ENGINE} />
          </MonitorAuEngineProvider>
        ),
      },
      {
        path: "monitor/ad_engine",
        element: (
          <MonitorAdEngineProvider>
            <SAWAFEdgeHealth type={WafNodeType.AD_ENGINE} />
          </MonitorAdEngineProvider>
        ),
      },
      {
        path: "monitor/es_engine",
        element: (
          <MonitorEsEngineProvider>
            <SAWAFEdgeHealth type={WafNodeType.ES_ENGINE} />
          </MonitorEsEngineProvider>
        ),
      },
      {
        path: "stats/omb_service_real",
        element: (
          <MonitorOmbServiceProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.OMB_SERVICE} />
          </MonitorOmbServiceProvider>
        ),
      },
      {
        path: "stats/waf_engine_real",
        element: (
          <MonitorProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.WAF_ENGINE} />
          </MonitorProvider>
        ),
      },
      {
        path: "stats/waf_engine_past",
        element: (
          <MonitorProvider>
            <SAWAFEdgeStatsHistory type={WafNodeType.WAF_ENGINE} />
          </MonitorProvider>
        ),
      },
      {
        path: "stats/rl_engine_real",
        element: (
          <MonitorEdgeProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.RL_ENGINE} />
          </MonitorEdgeProvider>
        ),
      },
      {
        path: "stats/rl_engine_past",
        element: (
          <MonitorEdgeProvider>
            <SAWAFEdgeStatsHistory type={WafNodeType.RL_ENGINE} />
          </MonitorEdgeProvider>
        ),
      },
      {
        path: "stats/bm_engine_real",
        element: (
          <MonitorBmEngineProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.BM_ENGINE} />
          </MonitorBmEngineProvider>
        ),
      },
      {
        path: "stats/au_engine_real",
        element: (
          <MonitorAuEngineProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.AU_ENGINE} />
          </MonitorAuEngineProvider>
        ),
      },
      {
        path: "stats/bm_engine_past",
        element: (
          <MonitorBmEngineProvider>
            <SAWAFEdgeStatsHistory type={WafNodeType.BM_ENGINE} />
          </MonitorBmEngineProvider>
        ),
      },
      {
        path: "stats/au_engine_past",
        element: (
          <MonitorAuEngineProvider>
            <SAWAFEdgeStatsHistory type={WafNodeType.AU_ENGINE} />
          </MonitorAuEngineProvider>
        ),
      },
      {
        path: "stats/ad_engine_real",
        element: (
          <MonitorAdEngineProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.AD_ENGINE} />
          </MonitorAdEngineProvider>
        ),
      },
      {
        path: "stats/es_engine_real",
        element: (
          <MonitorEsEngineProvider>
            <SAWAFEdgeStatsReal type={WafNodeType.ES_ENGINE} />
          </MonitorEsEngineProvider>
        ),
      },
      {
        path: "stats/es_engine_past",
        element: (
          <MonitorEsEngineProvider>
            <SAWAFEdgeStatsHistory type={WafNodeType.ES_ENGINE} />
          </MonitorEsEngineProvider>
        ),
      },
      {
        path: "organisation",
        element: (
          <OrganisationProvider>
            <SAOrganisation />
          </OrganisationProvider>
        ),
      },
      {
        path: "payment/stripe_config",
        element: (
          <PaymentProvider>
            <SAStripeConfig />
          </PaymentProvider>
        ),
      },
      {
        path: "payment/rate_limit_bill_config",
        element: (
          <PaymentProvider>
            <SARateLimitBillConfig />
          </PaymentProvider>
        ),
      },
      // {
      //   path: "payment/history",
      //   element: (
      //     <PaymentProvider>
      //       <SAPaymentHistoryOriginal />
      //     </PaymentProvider>
      //   ),
      // },
      {
        path: "payment/history",
        element: (
          <PaymentProvider>
            <SAPaymentHistoryCustom />
          </PaymentProvider>
        ),
      },
      {
        path: "payment/feature",
        element: (
          <PaymentProvider>
            <SAPaymentFeature />
          </PaymentProvider>
        ),
      },
      {
        path: "payment/common",
        element: (
          <PaymentProvider>
            <SAPaymentCommonPackage />
          </PaymentProvider>
        ),
      },
      {
        path: "payment/common/history",
        element: (
          <PaymentProvider>
            <SAPaymentCommonHistory />
          </PaymentProvider>
        ),
      },
      {
        path: "payment/custom",
        element: (
          <PaymentProvider>
            <ZcrmProvider>
              <SAPaymentCustomPackage />
            </ZcrmProvider>
          </PaymentProvider>
        ),
      },
      {
        path: "zcrm/api_config",
        element: (
          <ZcrmProvider>
            <SAZcrmApiConfig />
          </ZcrmProvider>
        ),
      },
      {
        path: "zcrm/product",
        element: (
          <ZcrmProvider>
            <SAZcrmProduct />
          </ZcrmProvider>
        ),
      },
      {
        path: "zcrm/account_contact",
        element: (
          <ZcrmProvider>
            <PaymentProvider>
              <SAZcrmAccountContact />
            </PaymentProvider>
          </ZcrmProvider>
        ),
      },
      {
        path: "zcrm/quote",
        element: (
          <ZcrmProvider>
            <PaymentProvider>
              <SAZcrmQuote />
            </PaymentProvider>
          </ZcrmProvider>
        ),
      },
      {
        path: "license_status/custom",
        element: (
          <PaymentProvider>
            <SACustomLicenseStatus />
          </PaymentProvider>
        ),
      },
      {
        path: "bm/aws_s3",
        element: (
          <BMProvider>
            <SAAwsS3Cfgs />
          </BMProvider>
        ),
      },
      {
        path: "au/aws_s3",
        element: (
          <AUProvider>
            {/* eslint-disable-next-line */}
            <AU_SAAwsS3Cfgs /> 
          </AUProvider>
        ),
      },
      /*
            {
                path: "bm/license",
                element: (
                    <BMProvider>
                        <SABmLicenseUsage />
                    </BMProvider>
                ),
            },
            {
                path: "bm/package",
                element: (
                    <BMProvider>
                        <SABMPackage />
                    </BMProvider>
                ),
            },
            {
                path: "bm/payment",
                element: (
                    <BMProvider>
                        <SABMPayment />
                    </BMProvider>
                ),
            },
            */
      {
        path: "ad/config",
        element: (
          <ADProvider>
            <SAAdCfgs />
          </ADProvider>
        ),
      },
      {
        path: "ad/exception",
        element: (
          <AdExceptionProvider>
            <OrganisationProvider>
              <SAAdException />
            </OrganisationProvider>
          </AdExceptionProvider>
        ),
      },
      {
        path: "rule/owasp",
        element: (
          <RuleProvider>
            <SAOwaspRule />
          </RuleProvider>
        ),
      },
      {
        path: "rule/ml",
        element: (
          <RuleProvider>
            <SAMlRule />
          </RuleProvider>
        ),
      },
      {
        path: "rule/sd",
        element: (
          <RuleProvider>
            <SASdRule />
          </RuleProvider>
        ),
      },
      {
        path: "rule/custom",
        element: (
          <RuleProvider>
            <SACustomRule />
          </RuleProvider>
        ),
      },
      {
        path: "rule/custom/new",
        element: (
          <RuleProvider>
            <SANewCustomRule />
          </RuleProvider>
        ),
      },
      {
        path: "rule/custom/edit/:customRuleId",
        element: (
          <RuleProvider>
            <SAEditCustomRule />
          </RuleProvider>
        ),
      },
      {
        path: "ssl",
        element: (
          <SSLProvider>
            <SASSL />
          </SSLProvider>
        ),
      },
      {
        path: "apikey/otx",
        element: (
          <ApiKeyProvider>
            <SAOtxApiKey />
          </ApiKeyProvider>
        ),
      },
      {
        path: "apikey/abuseipdb",
        element: (
          <ApiKeyProvider>
            <SAAbuseIpDbApiKey />
          </ApiKeyProvider>
        ),
      },
      {
        path: "captcha/general",
        element: (
          <CaptchaProvider>
            <SACaptchaGeneral />
          </CaptchaProvider>
        ),
      },
      {
        path: "captcha/api_keys",
        element: (
          <CaptchaProvider>
            <SACaptchaApiKeys />
          </CaptchaProvider>
        ),
      },
      {
        path: "captcha/block_pages",
        element: (
          <CaptchaProvider>
            <SACaptchaBlockPage />
          </CaptchaProvider>
        ),
      },
      {
        path: "admins/list",
        element: <SAAdmins />,
      },
      {
        path: "user/list/:orgID",
        element: <SAUser />,
      },
      {
        path: "user/report",
        element: <SAUserReport />,
      },
      {
        path: "waf_engine/list",
        element: (
          <WAFProvider>
            <SAWAFList type={WafNodeType.WAF_ENGINE} />
          </WAFProvider>
        ),
      },
      {
        path: "omb_service/list",
        element: (
          <OmbServiceProvider>
            <SAWAFList type={WafNodeType.OMB_SERVICE} />
          </OmbServiceProvider>
        ),
      },
      {
        path: "rl_engine/list",
        element: (
          <WAFEdgeProvider>
            <SAWAFList type={WafNodeType.RL_ENGINE} />
          </WAFEdgeProvider>
        ),
      },
      {
        path: "bm_engine/list",
        element: (
          <BmEngineProvider>
            <SAWAFList type={WafNodeType.BM_ENGINE} />
          </BmEngineProvider>
        ),
      },
      {
        path: "au_engine/list",
        element: (
          <AuEngineProvider>
            <SAWAFList type={WafNodeType.AU_ENGINE} />
          </AuEngineProvider>
        ),
      },
      {
        path: "ad_engine/list",
        element: (
          <AdEngineProvider>
            <SAWAFList type={WafNodeType.AD_ENGINE} />
          </AdEngineProvider>
        ),
      },
      {
        path: "es_engine/list",
        element: (
          <EsEngineProvider>
            <SAWAFList type={WafNodeType.ES_ENGINE} />
          </EsEngineProvider>
        ),
      },
      {
        path: "waf_edge/config",
        element: (
          <WAFEdgeProvider>
            <SAWAFConfig />
          </WAFEdgeProvider>
        ),
      },
      {
        path: "profile",
        element: <SAProfile />,
      },
      {
        path: "region/list",
        element: (
          <RegionProvider>
            <WAFEdgeProvider>
              <SARegionList />
            </WAFEdgeProvider>
          </RegionProvider>
        ),
      },
    ],
  },
  {
    path: "/super/home",
    element: (
      <SuperGuard>
        <UserProvider>
          <SALayout />
        </UserProvider>
      </SuperGuard>
    ),
    children: [
      {
        path: "",
        element: <SAHome />,
      },
    ],
  },
  {
    path: "",
    element: <PresentationLayout />,
    children: [
      {
        path: "",
        element: <Landing />,
      },
      {
        path: "auth/login",
        element: <LogIn />,
      },
      {
        path: "auth/forbidden",
        element: <Page403 />,
      },
    ],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      /*
            {
                path: "signin",
                element: <SignIn />,
            },
            {
                path: "signup",
                element: <SignUp />,
            },
            {
                path: "signout",
                element: <SignOut />,
            },
            {
                path: "forgotpassword",
                element: <ForgotPassword />,
            },
            {
                path: "reset-password/:token",
                element: <ResetPassword />,
            },
            */
      {
        path: "verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "accept-terms",
        element: <AgreePolicy />,
      },
    ],
  },
  {
    path: "",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: "home",
        element: (
          <HomeProvider>
            <Home />
          </HomeProvider>
        ),
      },
    ],
  },
  {
    path: "application",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: "",
        element: <Application />,
      },
      {
        path: "sites",
        element: <Websites />,
      },
      {
        path: "sites/new",
        element: (
          <SslConfigProvider>
            <WAFRuleProvider>
              <NewWebsite />
            </WAFRuleProvider>
          </SslConfigProvider>
        ),
      },
      {
        path: ":configSite/ssl",
        element: (
          <SslConfigProvider>
            <SSLOverview />
          </SslConfigProvider>
        ),
      },
      {
        path: ":configSite/ssl/config",
        element: (
          <SslConfigProvider>
            <SSLConfig />
          </SslConfigProvider>
        ),
      },
      {
        path: ":configSite/firewall",
        element: (
          <FirewallProvider>
            <Firewall />
          </FirewallProvider>
        ),
      },
      {
        path: ":configSite/firewall/new",
        element: (
          <FirewallProvider>
            <NewFirewall />
          </FirewallProvider>
        ),
      },
      {
        path: ":configSite/firewall/edit/:firewallID",
        element: (
          <FirewallProvider>
            <EditFirewall />
          </FirewallProvider>
        ),
      },
      {
        path: ":configSite/ratelimit",
        element: (
          <RateLimitProvider>
            <RateLimit />
          </RateLimitProvider>
        ),
      },
      {
        path: ":configSite/ratelimit/new",
        element: (
          <RateLimitProvider>
            <NewRateLimit />
          </RateLimitProvider>
        ),
      },
      {
        path: ":configSite/ratelimit/edit/:ratelimitID",
        element: (
          <RateLimitProvider>
            <EditRateLimit />
          </RateLimitProvider>
        ),
      },

      {
        path: "profile/personal",
        element: <PersonalProfile />,
      },
      {
        path: "profile/key",
        element: (
          <KeyProvider>
            <PersonalAPIKey />
          </KeyProvider>
        ),
      },
      {
        path: "profile/payment",
        element: (
          <PaywallProvider>
            <PaymentProfile />
          </PaywallProvider>
        ),
      },
    ],
  },
  {
    path: "application",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: ":configSite/waf/dashboard",
        element: <WAFDashboard />,
      },
      {
        path: ":configSite/waf/config",
        element: (
          <WAFRuleProvider>
            <WAFConfig />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/config/block_page",
        element: (
          <WAFRuleProvider>
            <WAFCustomBlockPage />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/config/block_page/new",
        element: (
          <WAFRuleProvider>
            <NewCustomBlockPage />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/config/rule",
        element: (
          <WAFRuleProvider>
            <WAFRule />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/config/sd_sig_rule",
        element: (
          <WAFRuleProvider>
            <WAFSdSigRule />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/exception",
        element: (
          <WAFRuleProvider>
            <WAFException />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/exception/new",
        element: (
          <WAFRuleProvider>
            <NewWAFExcption />
          </WAFRuleProvider>
        ),
      },
      {
        path: ":configSite/waf/exception/edit/:exceptionID",
        element: (
          <WAFRuleProvider>
            <EditWAFExcption />
          </WAFRuleProvider>
        ),
      },
      {
        path: "waf/rule/custom",
        element: (
          <WAFRuleProvider>
            <CustomRule />
          </WAFRuleProvider>
        ),
      },
      {
        path: "waf/rule/custom/new",
        element: (
          <WAFRuleProvider>
            <NewCustomRule />
          </WAFRuleProvider>
        ),
      },
      {
        path: "waf/rule/custom/edit/:customRuleId",
        element: (
          <WAFRuleProvider>
            <EditCustomRule />
          </WAFRuleProvider>
        ),
      },
    ],
  },
  {
    path: "application",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: ":configSite/bot/dashboard",
        element: (
          <BMConfigProvider>
            <EventProvider>
              <BMDashboard />
            </EventProvider>
          </BMConfigProvider>
        ),
      },
      {
        path: ":configSite/bot/config",
        element: (
          <BMConfigProvider>
            <BMConfig />
          </BMConfigProvider>
        ),
      },
      {
        path: ":configSite/bot/exception",
        element: (
          <BMConfigProvider>
            <BMException />
          </BMConfigProvider>
        ),
      },
      {
        path: ":configSite/bot/exception/new",
        element: (
          <BMConfigProvider>
            <NewBotException />
          </BMConfigProvider>
        ),
      },
      {
        path: ":configSite/bot/exception/edit/:botExceptionID",
        element: (
          <BMConfigProvider>
            <EditBotException />
          </BMConfigProvider>
        ),
      },
      {
        path: ":configSite/auth/dashboard",
        element: (
          <AUConfigProvider>
            <EventProvider>
              <AUDashboard />
            </EventProvider>
          </AUConfigProvider>
        ),
      },
      {
        path: ":configSite/auth/config",
        element: (
          <AUConfigProvider>
            <AUConfig />
          </AUConfigProvider>
        ),
      },
      {
        path: ":configSite/auth/exception",
        element: (
          <AUConfigProvider>
            <AUException />
          </AUConfigProvider>
        ),
      },
      {
        path: ":configSite/auth/exception/new",
        element: (
          <AUConfigProvider>
            <NewAuthException />
          </AUConfigProvider>
        ),
      },
      {
        path: ":configSite/auth/exception/edit/:authExceptionID",
        element: (
          <AUConfigProvider>
            <EditAuthException />
          </AUConfigProvider>
        ),
      },
      {
        path: ":configSite/ddos/config",
        element: (
          <DdosConfigProvider>
            <DdosConfig />
          </DdosConfigProvider>
        ),
      },
    ],
  },
  {
    path: "/application/analytics",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: "events",
        element: (
          <EventProvider>
            <AnalyticsEvents />
          </EventProvider>
        ),
      },
      {
        path: "events/:eventID",
        element: (
          <EventProvider>
            <AnalyticsEventsDetail />
          </EventProvider>
        ),
      },
      {
        path: "bot_events",
        element: (
          <EventProvider>
            <BMConfigProvider>
              <AnalyticsBotEvents />
            </BMConfigProvider>
          </EventProvider>
        ),
      },
      {
        path: "bot_events/:eventID",
        element: (
          <EventProvider>
            <AnalyticsBotEventsDetail />
          </EventProvider>
        ),
      },
      {
        path: "auth_events",
        element: (
          <EventProvider>
            <AUConfigProvider>
              <AnalyticsAuthEvents />
            </AUConfigProvider>
          </EventProvider>
        ),
      },
      {
        path: "auth_events/:eventID",
        element: (
          <EventProvider>
            <AnalyticsAuthEventsDetail />
          </EventProvider>
        ),
      },
      {
        path: "rl_events",
        element: (
          <EventProvider>
            <RateLimitProvider>
              <AnalyticsRLEvents />
            </RateLimitProvider>
          </EventProvider>
        ),
      },
      {
        path: "rl_events/:eventID",
        element: (
          <EventProvider>
            <AnalyticsRLEventsDetail />
          </EventProvider>
        ),
      },
    ],
  },
  {
    path: "/application/admin",
    element: (
      <AuthGuard>
        <SiteProvider>
          <NormalLayout />
        </SiteProvider>
      </AuthGuard>
    ),
    children: [
      {
        path: "webhook",
        element: (
          <AdminProvider>
            <Webhook />
          </AdminProvider>
        ),
      },
      {
        path: "log",
        element: (
          <AdminProvider>
            <Log />
          </AdminProvider>
        ),
      },
      {
        path: "account",
        element: (
          <AdminProvider>
            <Users />
          </AdminProvider>
        ),
      },
      {
        path: "saml",
        element: (
          <AdminProvider>
            <IdPProvider>
              <SAMLConfig />
            </IdPProvider>
          </AdminProvider>
        ),
      },
      {
        path: "plan",
        element: (
          <PaywallProvider>
            <PlanSummary />
          </PaywallProvider>
        ),
      },
      {
        path: "plan/pay/:planID",
        element: (
          <PaywallProvider>
            <Paywall />
          </PaywallProvider>
        ),
      },
    ],
  },
  {
    path: "",
    element: (
      <AuthGuard>
        <AuthLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "*",
        element: <Page404 />,
      },
      {
        path: "500",
        element: <Page500 />,
      },
    ],
  },
];
export default routes;
