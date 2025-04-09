import { Button, MessageBox, Notification  } from 'element-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { connect } from "react-redux";
interface Props {  
  Title: string,  
  Ok: any,
  Canel: any   
}

const CtrlConfirm = forwardRef((props: Props, ref) => {  
    useImperativeHandle(ref, () => ({
      showConfirm: (type: String, message: String) => {showConfirm()}
    }));
    const showConfirm = () => {
      MessageBox.confirm(props.Title, 'Cảnh báo', {
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy',
        type: 'warning'
      }).then(() => {
        props.Ok();
      }).catch(() => {
        props.Canel();
      });
    }
    return(
        <></>
    )
});
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps, null, { forwardRef: true })(CtrlConfirm);