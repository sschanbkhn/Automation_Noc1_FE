import menu_config from "assets/json/menu_config.json";
import Anm_uc1 from "components/ANM/UC1";
import {
  CategoryAlarmCode,
  CategoryAlarmLevel,
  CategoryAlarmType,
  CategoryStatus,
} from "components/Category";
import Page401 from "components/common/Page401";
import Page404 from "components/common/Page404";
import Profile from "components/common/Profile";
import Setting from "components/common/Setting";
import Support from "components/common/Support";
import I004_1List from "components/I004_1";
import Ucppoe from "components/INOC1/I003";
import {
  CableManagement,
  ConfigurationLogs,
  CurenAlarm,
  DevicePorts,
  Devices,
  DeviceTypes,
  HistoryCurenAlarm,
  Manufacturers,
} from "components/Network";
import ScheduleTriggerForm from "components/RNOC1/R009";
import NornirPlatformView from "components/SNOC/components/NornirPlatformView";
import DashOrigin from "components/SNOC/views/dashboard/DashOrigin/SystemHealthDashboard";
import { Config } from "components/System";
import { Account, Organ, Permission, Role } from "components/User";
import { Cookie } from "helpers/cookie";
import { IUserInfo } from "models/Apps";
import React from "react";
import { connect } from "react-redux";
import { Route, Routes } from "react-router-dom";
import CenterDashboard from "../DashboardAutomation/CenterDashboard";
import RoomDashboard from "../DashboardAutomation/RoomDashboard";

import ClearThuebaoDaphien from "components/INOC1/I003";
import LspQuocte from "components/INOC1/I004";
import DataLspQuocte from "components/INOC1/I004_1";
import DashboardR001 from "components/RNOC1/R001";
import Sleeping from "components/RNOC1/R005-SleepingCell/R005HomeSleepingCell";
import {
  default as ConfigReport,
  default as DashboardR007,
} from "components/RNOC1/R009";
import DnsConfigDashboard from "components/SNOC/views/dashboard/DashOrigin/DnsConfigDashboard";
import SbcDashboardWithNavbar from "components/SNOC/views/dashboard/DashOrigin/SbcDashboardWithNavbar";
import DnsLacracrnc from "components/SNOC/views/forms/dns/Dnslacracrnc";
import TACConfigPanel from "components/SNOC/views/forms/dns/TACConfigPanel";
import Healthcheck from "components/SNOC/views/forms/health/Healthcheck";
import Schedule from "components/SNOC/views/forms/health/Schedule";
import CreateConnectionForm from "components/SNOC/views/forms/sbc/CreateConnectionForm";
import DeclareNumberForm from "components/SNOC/views/forms/sbc/DeclareNumberForm";
import RequestHistoryTable from "components/SNOC/views/forms/sbc/RequestHistoryTable";
import RoutingDeclarationForm from "components/SNOC/views/forms/sbc/RoutingDeclarationForm";
import HistoricalReporting from "components/SNOC/views/tables/health/HistoricalReporting";
/// SNOC
import RequireSnocAuthInline from "components/SNOC/auth/RequireSnocAuthInline";
import SnocLoginInline from "components/SNOC/auth/SnocLoginInline";
import SnocSubApp from "components/SNOC/SnocSubApp";
import HostConfigPanel from "components/SNOC/views/forms/hosts/HostConfigPanel";
import KPIChartDashboard from "components/SNOC/views/forms/kpi/KPIChartDashboard";
import KPISelectorPage from "components/SNOC/views/forms/kpi/KPISelectorPage";
///
interface Props {
  Apps: any;
}
const SNOC_CODES = new Set<string>([
  "hc-dashboard",
  "hc-dashboard-dns",
  "hc-dashboard-sbc",
  "hc-snoc-admin-dashboard",
]);

const MainPageRoute = (props: Props) => {
  const GetPage = (code: String) => {
    switch (code) {
      case "Home":
        // return <Home />;
        return <CenterDashboard />;
      case "Config":
        return <Config />;
      case "Account":
        return <Account />;
      case "Organ":
        return <Organ />;
      case "Permission":
        return <Permission />;
      case "Role":
        return <Role />;
      case "CategoryStatus":
        return <CategoryStatus />;
      case "CategoryAlarmCode":
        return <CategoryAlarmCode />;
      case "CategoryAlarmLevel":
        return <CategoryAlarmLevel />;
      case "CategoryAlarmType":
        return <CategoryAlarmType />;
      case "ConfigReport":
        return <ConfigReport />;
      case "DashboardR001":
        return <DashboardR001 />;
      case "CableManagement":
        return <CableManagement />;
      case "ConfigurationLogs":
        return <ConfigurationLogs />;
      case "CurenAlarm":
        return <CurenAlarm />;
      case "HistoryCurenAlarm":
        return <HistoryCurenAlarm />;
      case "DevicePorts":
        return <DevicePorts />;
      case "Devices":
        return <Devices />;
      case "DeviceTypes":
        return <DeviceTypes />;
      case "Manufacturers":
        return <Manufacturers />;
      case "NornirPlatformView":
        return <NornirPlatformView />;
      case "CenterDashboard":
        return <CenterDashboard />;
      case "RoomDashboard":
        return <RoomDashboard />;
      case "DashboardR001":
        return <DashboardR001 />;
      case "DashboardR002":
        return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "DashboardR003":
        return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "DashboardR004":
        return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "DashboardR005":
        return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "DashboardR006":
        return <DashboardR001 />; // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "DashboardR007":
        return <DashboardR007 />;
      case "SleepingCellManagement":
        return <Sleeping />;
      // Tạm thời dùng DashboardR001, sau này thay bằng component thực tế
      case "ScheduleTriggerForm":
        return <ScheduleTriggerForm />;
      case "anm_uc1":
        return <Anm_uc1 />;
      case "ucppoe":
        return <Ucppoe />;
      case "i004_1":
        return <I004_1List />;
      case "hc-dashboard":
        return <DashOrigin />;
      case "hc-dashboard-dns":
        return <DnsConfigDashboard />;
      case "hc-dashboard-sbc":
        return <SbcDashboardWithNavbar />;
      case "ClearThuebaoDaphien":
        return <ClearThuebaoDaphien />;
      case "LspQuocte":
        return <LspQuocte />;
      case "DataLspQuocte":
        return <DataLspQuocte />;
      default:
        return <Page404 />;
    }
  };
  // const RouteRender = () => {
  //   let html = [];
  //   let rootMenu: any = menu_config.Menu;
  //   for (let i = 0; i < rootMenu.length; i++) {
  //     let menu = rootMenu[i];
  //     if (IsMenuOfUser(menu)) {
  //       // BỎ QUA các route SNOC (để tránh trùng với nhóm RequireSnocAuthInline phía dưới)
  //       if (!SNOC_CODES.has(menu.code)) {
  //         html.push(
  //           <Route
  //             key={menu.code}
  //             path={menu.url}
  //             element={GetPage(menu.code)}
  //           />
  //         );
  //       }
  //       html.push(
  //         <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
  //       );
  //     }
  //     if (menu.subMenu && menu.subMenu.length > 0) {
  //       for (let j = 0; j < menu.subMenu.length; j++) {
  //         let subMenu = menu.subMenu[j];
  //         if (IsMenuOfUser(subMenu)) {
  //           html.push(
  //             <Route
  //               key={subMenu.code}
  //               path={subMenu.url}
  //               element={GetPage(subMenu.code)}
  //             />
  //           );
  //         }
  //       }
  //     }
  //   }
  //   return html;
  // };

  const RouteRender = () => {
    const html: JSX.Element[] = [];
    const rootMenu: any = menu_config.Menu;

    for (const menu of rootMenu) {
      if (!IsMenuOfUser(menu)) continue;

      // 🔒 BỎ QUA HOÀN TOÀN route SNOC ở đây
      if (!SNOC_CODES.has(menu.code)) {
        html.push(
          <Route key={menu.code} path={menu.url} element={GetPage(menu.code)} />
        );
      }

      if (menu.subMenu?.length) {
        for (const sub of menu.subMenu) {
          if (IsMenuOfUser(sub) && !SNOC_CODES.has(sub.code)) {
            html.push(
              <Route
                key={sub.code}
                path={sub.url}
                element={GetPage(sub.code)}
              />
            );
          }
        }
      }
    }
    return html;
  };

  const IsMenuOfUser = (menu: any) => {
    let userInfo: IUserInfo = JSON.parse(Cookie.getCookie("UserInfo"));
    if (userInfo.UserName == "admin") return true;
    if (userInfo) {
      for (let i = 0; i < userInfo.Menus.length; i++) {
        if (userInfo.Menus[i] == menu.code) {
          return true;
        }
      }
    }
    return false;
  };
  return (
    <Routes>
      {RouteRender()}
      <Route path="/dashboard/field/:fieldName" element={<RoomDashboard />} />
      <Route path="/dashboard" element={<CenterDashboard />} />
      <Route path="/dashboard/room/:roomId" element={<RoomDashboard />} />
      <Route key="Profile" path="/profile" element={<Profile />} />
      <Route key="Setting" path="/setting" element={<Setting />} />
      <Route key="Support" path="/support" element={<Support />} />
      <Route key="401" path="/page401" element={<Page401 />} />
      <Route key="404" path="/page404" element={<Page404 />} />
      <Route path="/schedule-trigger-form" element={<ScheduleTriggerForm />} />
      {/* Phần riêng cho SNOC */}
      <Route element={<SnocSubApp />}>
        <Route path="/snoc/login" element={<SnocLoginInline />} />
        <Route element={<RequireSnocAuthInline />}>
          {/* các route SNOC cần login */}

          <Route path="/app/dashboard/origin" element={<DashOrigin />} />
          <Route path="/healthcheck/devices" element={<HostConfigPanel />} />
          <Route path="/healthcheck/schedule" element={<Schedule />} />
          <Route path="/healthcheck/checks" element={<Healthcheck />} />
          <Route
            path="/healthcheck/history"
            element={<HistoricalReporting />}
          />
          <Route path="/healthcheck/kpi" element={<KPIChartDashboard />} />
          <Route path="/healthcheck/kpischedule" element={<Schedule />} />
          <Route path="/kpi/:system/:subsystem" element={<KPISelectorPage />} />
          <Route path="/healthcheck/:group" element={<Healthcheck />} />
          <Route
            path="/healthcheck/:group/:subsystem"
            element={<Healthcheck />}
          />
          <Route path="/app/dashboard/dns" element={<DnsConfigDashboard />} />
          <Route path="/dns/tacs" element={<TACConfigPanel />} />
          <Route path="/dns/lacracrnc" element={<DnsLacracrnc />} />
          <Route path="/dns/apns" element={<TACConfigPanel />} />
          <Route
            path="/app/dashboard/sbc"
            element={<SbcDashboardWithNavbar />}
          />

          <Route path="/sbc/dashboard" element={<SbcDashboardWithNavbar />} />
          <Route
            path="/sbc/CreateConnectionForm"
            element={<CreateConnectionForm />}
          />
          <Route
            path="/sbc/DeclareNumberForm"
            element={<DeclareNumberForm />}
          />
          <Route
            path="/sbc/RoutingDeclarationForm"
            element={<RoutingDeclarationForm />}
          />
          <Route
            path="/sbc/RequestHistoryTable"
            element={<RequestHistoryTable />}
          />
        </Route>
      </Route>
      {/* Kết thúc phần SNOC */}
    </Routes>
  );
};
const mapState = ({ ...state }) => ({
  Apps: state.apps,
});
const mapDispatchToProps = {};

export default connect(mapState, mapDispatchToProps)(MainPageRoute);
