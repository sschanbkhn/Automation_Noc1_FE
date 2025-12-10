import React,{useState} from 'react';
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import { FiBarChart2 } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faChartBar, faEye, faTachometerAlt,faCog ,faBinoculars} from "@fortawesome/free-solid-svg-icons";
// import { FiHome } from "react-icons/fi";
// type ButtonProps = {
//   onChangeTab: (tabName: string) => void;
// };
type ButtonProps = {
  onChangeTab: (tabName: string) => void;
  tab: string;
};
  // const [tab, setTab] = useState('toanquoc');

// { onChangeTab }: ButtonProps
// function Button({ onChangeTab }: ButtonProps) {
function Button({ onChangeTab, tab }: ButtonProps) {
  // Animation cho header
  const headerAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 300, friction: 30 }
  });

  
  function updateDashboard() {
             onChangeTab('dashboard');
    }
  function updateGiamSat() {
             onChangeTab('giamsat');
    }
  function updateThietLap() {
             onChangeTab('thietlap');
    }
  return (
     <div className="flex-grow-1">
    <div style={{  width: '100%', display: 'flex', gap: '10px' }}>
                {/* <button className={`nut_bam ${tab === 'toanquoc' ? 'active' : ''}`} onClick={updateToanQuoc}>Toàn Quốc</button>
                <button className={`nut_bam ${tab === 'mienbac' ? 'active' : ''}`} onClick={updateMienBac}>Miền Bắc</button>
                <button className={`nut_bam ${tab === 'mientrung' ? 'active' : ''}`} onClick={updateMienTrung}>Miền Trung</button>
                <button className={`nut_bam ${tab === 'miennam' ? 'active' : ''}`} onClick={updateMienNam}>Miền Nam</button> */}
                <button className={`nut_bam ${tab === 'dashboard' ? 'active' : ''}`} onClick={updateDashboard} >
                  <FontAwesomeIcon icon={faTachometerAlt} style={{ color: "#3F51B5" }} className="me-2" />  
                  Dashboard
                </button>
                <button className={`nut_bam ${tab === 'giamsat' ? 'active' : ''}`} onClick={updateGiamSat}>
                  <FontAwesomeIcon icon={faBinoculars} style={{ color: "#009688" }} className="me-2" />
                  Giám Sát
                  </button>
                <button className={`nut_bam ${tab === 'thietlap' ? 'active' : ''}`} onClick={updateThietLap}>
                   <FontAwesomeIcon icon={faCog} style={{ color: "#FFC107" }} className="me-2" />
                   Thiết Lập
                  </button>
              </div>
            </div>
    
  );
}
export default Button;
