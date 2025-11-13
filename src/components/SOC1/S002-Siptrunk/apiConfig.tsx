// const IS_LOCAL = true; // true: local, false: server

// const API_CONFIG = {
//   BASE_URL: IS_LOCAL 
//     ? "http://127.0.0.1:8000" // Local development
//     : "http://10.155.43.210:8000" // Production server
// };
//Chia loại API để vào dev hoặc production
  // let ENV = "dev"; // hoặc "prod"
  let ENV = "prod";
  let API_URL = "";
  if (ENV === "dev") {API_URL = "http://127.0.0.1:8000/api/siptrunk";} 
  else {API_URL = "http://10.155.43.210:8000/api/siptrunk";}

export default API_URL;