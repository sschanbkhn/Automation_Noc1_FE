import { faEnvelope, faFolderOpen, faNetworkWired, faShieldAlt, faClock, faDatabase, faServer, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { ConfigModule } from "./ConfigTypes";
import API_CONFIG from "../Designer/ApiR003PRBLoadBalancingConfig";

export const configTableMapping: { [key: number]: { table: string; api: string; title: string } } = {
  1: {
    table: "outlook",
    api: API_CONFIG.BASE_URL + "/configuration/get-outlook",
    title: "Email Configuration",
  },
  2: {
    table: "tablefilepath",
    api: API_CONFIG.BASE_URL + "/configuration/get-filepath",
    title: "File Path Management",
  },
  3: {
    table: "objtablemrbts_infor",
    api: API_CONFIG.BASE_URL + "/configuration/get-mrbts",
    title: "MRBTS Information",
  },
  4: {
    table: "objtableresetsitecountlimits",
    api: API_CONFIG.BASE_URL + "/configuration/get-resetlimits",
    title: "Reset Site Limits",
  },
  5: {
    table: "objtablescheduler",
    api: API_CONFIG.BASE_URL + "/configuration/get-scheduler",
    title: "Scheduler Configuration",
  },
  6: {
    table: "objtabledatabaseinfor",
    api: API_CONFIG.BASE_URL + "/configuration/get-infor-database",
    title: "Database Settings",
  },
  7: {
    table: "objtableaccountssh",
    api: API_CONFIG.BASE_URL + "/configuration/get-ssh-accounts",
    title: "SSH Account Settings",
  },
  8: {
    table: "archive-reports",
    api: API_CONFIG.BASE_URL + "/configuration/archive-reports?page=1&pageSize=50",
    title: "Detail Archive Reports",
  },
};

export const configModules: ConfigModule[] = [
  {
    id: 1,
    title: "Email Configuration",
    description: "SMTP & Notification Settings",
    icon: faEnvelope,
    iconColor: "#3b82f6",
    status: "active",
  },
  {
    id: 2,
    title: "File Path Management",
    description: "Storage & Directory Config",
    icon: faFolderOpen,
    iconColor: "#10b981",
    status: "active",
  },
  {
    id: 3,
    title: "Threshold Setting",
    description: "Network & Topology Settings",
    icon: faNetworkWired,
    iconColor: "#f59e0b",
    status: "active",
  },
  {
    id: 4,
    title: "CR Cell Limit",
    description: "Safety Threshold Controls",
    icon: faShieldAlt,
    iconColor: "#ef4444",
    status: "active",
  },
  {
    id: 5,
    title: "Scheduler Configuration",
    description: "Automated Task Management",
    icon: faClock,
    iconColor: "#8b5cf6",
    status: "active",
  },
  {
    id: 6,
    title: "Database Settings",
    description: "Connection & Backup Config",
    icon: faDatabase,
    iconColor: "#06b6d4",
    status: "maintenance",
  },
  {
    id: 7,
    title: "SSH Account Settings",
    description: "Remote Access & Authentication",
    icon: faServer,
    iconColor: "#ff6b35",
    status: "active",
  },
  {
    id: 8,
    title: "Detail Archive Reports",
    description: "Historical Data & Analytics",
    icon: faChartLine,
    iconColor: "#8e44ad",
    status: "active",
  },
];
