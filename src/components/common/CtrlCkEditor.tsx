import { Input } from 'element-react';
import React, { useEffect, useRef, useState } from 'react'
import { connect } from "react-redux";
import { Editor } from '@tinymce/tinymce-react';

interface Props {
    key?: any,
    value: any,
    type?: string,
    size?: any,
    placeholder?: string,
    readOnly?: boolean,
    disabled?: boolean,
    autoFocus?: boolean,
    onChange: Function,
    rows?: any
}

const CtrlCkEditor = (props: Props) => { 
  const editorRef = useRef(null);
  const handelChange = (e:any, editor:any) => {

  }
  const handelBlur = (e:any) => {
    let content = editorRef.current.getContent();
    props.onChange(content)
  } 
    return (
      <>
        <Editor
          apiKey='z2vm023zuhxufhboc64q7b1o93q3upwbvenxl4wdfunm5hp7'
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={props.value}
          onEditorChange={handelChange}
          onBlur={handelBlur}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | code | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
          }}
        />
      </>
    )
}
const mapState = ({ ...state }) => ({
    
});
const mapDispatchToProps = {
    
};

export default connect(mapState, mapDispatchToProps)(CtrlCkEditor);