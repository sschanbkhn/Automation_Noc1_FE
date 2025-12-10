// let BACKEND_SERVER = null;
// if (process.env.REACT_APP_BACKEND_SERVER) {
//   BACKEND_SERVER = process.env.REACT_APP_BACKEND_SERVER;
// } else {
//   BACKEND_SERVER = "http://10.155.43.201/api/";
// }
// let BACKEND_SERVER_MEDIA = "http://10.155.43.201";

// export const BASENAME = ''; // don't add '/' at end off BASENAME
// export const BASE_URL = '/app/dashboard/default';
// export const BASE_TITLE = ' | React Datta Able ';
// export const API_SERVER = BACKEND_SERVER;
// export const SERVER_MEDIA = BACKEND_SERVER_MEDIA;
// export const CONFIG = {
//   layout: 'vertical', // disable on free version
//   subLayout: '', // disable on free version
//   collapseMenu: true, // mini-menu
//   layoutType: 'menu-dark', // disable on free version
//   navIconColor: false, // disable on free version
//   headerBackColor: 'header-default', // disable on free version
//   navBackColor: 'navbar-default', // disable on free version
//   navBrandColor: 'brand-default', // disable on free version
//   navBackImage: false, // disable on free version
//   rtlLayout: false, // disable on free version
//   navFixedLayout: true, // disable on free version
//   headerFixedLayout: false, // disable on free versions
//   boxLayout: false, // disable on free version
//   navDropdownIcon: 'style1', // disable on free version
//   navListIcon: 'style1', // disable on free version
//   navActiveListColor: 'active-default', // disable on free version
//   navListTitleColor: 'title-default', // disable on free version
//   navListTitleHide: false, // disable on free version
//   configBlock: true, // disable on free version
//   layout6Background: 'linear-gradient(to right, #A445B2 0%, #D41872 52%, #FF0066 100%)', // disable on free version
//   layout6BackSize: '' // disable on free version
// };

// let BACKEND_SERVER = "http://10.155.43.201:8000/api/";
// let BACKEND_SERVER_MEDIA = "http://10.155.43.201:8000";
let BACKEND_SERVER =
  process.env.REACT_APP_SNOC_API_URL || "http://10.147.50.100:8000/api";
let BACKEND_SERVER_MEDIA = process.env.REACT_APP_SNOC_API_URL
  ? process.env.REACT_APP_SNOC_API_URL.replace("/api", "")
  : "http://10.147.50.100:8000";
// Kiểm tra kỹ để tránh ReferenceError nếu process không tồn tại

export const API_SERVER = BACKEND_SERVER;
export const SERVER_MEDIA = BACKEND_SERVER_MEDIA;
