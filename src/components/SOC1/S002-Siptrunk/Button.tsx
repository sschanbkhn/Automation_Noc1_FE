import React,{useState} from 'react';
import { Container } from 'react-bootstrap';
import { useSpring, animated } from '@react-spring/web';
import { FiBarChart2 } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
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

  function updateToanQuoc() {
            onChangeTab('toanquoc');
                }
  function updateAaranetMienBac() {
             onChangeTab('a// mienbac');
    }
  function updateAaranetMienNam() {
             onChangeTab('a// miennam');
    }
  function updateImsMienBac() {
             onChangeTab('ims mienbac');
    }
  function updateImsMienNam() {
             onChangeTab('ims miennam');
    }
  function updateThietLap() {
             onChangeTab('thietlap');
    }
  return (
     <div className="flex-grow-1">
    <div style={{  width: '100%', display: 'flex', gap: '10px' }}>
                {/* <button className="nut_bam" onClick={updateToanQuoc}>Toàn Quốc</button>
                <button className="nut_bam" onClick={updateMienBac}>Miền Bắc</button>
                <button className="nut_bam" onClick={updateMienTrung}>Miền Trung</button>
                <button className="nut_bam" onClick={updateMienNam}>Miền Nam</button>
                <button className="nut_bam" onClick={updateThietLap}>Thiết lập</button> */}
                <button className={`nut_bam ${tab === 'toanquoc' ? 'active' : ''}`} onClick={updateToanQuoc}>Toàn Quốc</button>
        <button className={`nut_bam ${tab === 'a// mienbac' ? 'active' : ''}`} onClick={updateAaranetMienBac}>Aaranet Miền Bắc</button>
        <button className={`nut_bam ${tab === 'a// miennam' ? 'active' : ''}`} onClick={updateAaranetMienNam}>Aaranet Miền Nam</button>
        <button className={`nut_bam ${tab === 'ims mienbac' ? 'active' : ''}`} onClick={updateImsMienBac}>vIms Miền Bắc</button>
        <button className={`nut_bam ${tab === 'ims miennam' ? 'active' : ''}`} onClick={updateImsMienNam}>vIms Miền Nam</button>
        <button className={`nut_bam ${tab === 'thietlap' ? 'active' : ''}`} onClick={updateThietLap}>Thiết lập</button>
              </div>
               </div>
    
  );
}

export default Button;
