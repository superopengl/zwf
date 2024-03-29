import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { Typography, Skeleton, Button } from 'antd';
import { Editor as TinymceReact } from '@tinymce/tinymce-react';

const { Paragraph, Text } = Typography

const DEFAULT_SAMPLE = ``;

export const RichTextInput = React.memo(React.forwardRef((props, editorRef) => {

  const { value, disabled, onChange, placeholder, editorConfig } = props;
  // const editorRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  const [initValue, setInitValue] = React.useState(value);

  React.useEffect(() => {
    return () => {
      editorRef?.current?.destroy();
    }
  }, [])

  const log = () => {
    if (editorRef.current) {
      // console.log(editorRef.current.getContent());
    }
  };

  const handleEditorLoad = () => {
    setReady(true)
  };

  const imagesUploadHandler = (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1]; // Extract the base64 data from the FileReader result
        // window.tinymce.activeEditor.insertContent('<img src="' + `data:${blobInfo.blob().type};base64, ${base64Data}` + '">');
        // resolve();
        resolve(`data:${blobInfo.blob().type};base64,${base64Data}`); // Pass the base64 image URL to TinyMCE
      };
      reader.readAsDataURL(blobInfo.blob());
    })
  }

  return (
    <>
      {!ready && <Skeleton active ></Skeleton>}
      <TinymceReact
        // apiKey='3bmfxh7ddj07yqd2q0zicz9kckvcshqd1dwypp5tws9snpam'
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
        onInit={(evt, editor) => {
          editorRef.current = editor
        }}
        // initialValue={initValue}
        value={value}
        onEditorChange={onChange}
        init={{
          // height: 'calc(100vh - 240px)',
          height: 800,
          plugins: 'importcss searchreplace autolink directionality visualblocks visualchars link template table charmap nonbreaking anchor advlist lists autoresize img64upload export',
          menubar: false, //'file edit view insert format tools table tc help',
          toolbar: 'export | blocks fontfamily fontsize  | bold italic underline strikethrough removeformat | blockquote superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent numlist bullist checklist forecolor backcolor | img64upload table',
          toolbar_sticky: false,
          // extended_valid_elements: 'img[src|alt|width|height]',
          content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:16px } .editor-variable {
            cursor: default;
            background-color: #0FBFC433;
            border: 1px solid #red;
            // color: #FFFFFF;
            border-radius: 3px;
            padding: 1px 6px;
            font-weight: 400;
            font-style: normal;
            // font-size: 85%;
            line-height: 1.2;
            font-family: monospace;
          }`,
          toolbar_mode: 'wrap',
          automatic_uploads: false,
          branding: false,
          elementpath: false,
          statusbar: false,
          contextmenu: false,
          variable_class: "editor-variable",
          paste_data_images: true,
          link_default_target: '_blank',
          link_default_protocol: 'https',
          image_title: false,
          file_picker_types: 'image',
          images_reuse_filename: true,
          // automatic_uploads: true,
          // autoresize_bottom_margin: 100,
          onpageload: handleEditorLoad,
          images_upload_handler: imagesUploadHandler,
          image_description: false,
          image_dimensions: false,
          typeahead_urls: false,
          // images_upload_handler2: (blobInfo, success, failure, progress) => {
          //   const imageSize = blobInfo.blob().size;
          //   const maxSize = 1 * 1000 * 1000;
          //   if (imageSize > maxSize) {
          //     failure(`Image is too large. Maximum image size is ${maxSize / 1000 / 1000} MB`);
          //     return;
          //   }
          //   const uri = blobInfo.blobUri()
          //   success(uri);
          //   progress(100);
          // },
          placeholder,
          // min_height: 842,
          // min_height: 'calc(100vh - 240px)',
          ...editorConfig
        }}
      />
      {/* <Button onClick={log}>Log editor content</Button> */}
    </>
  );
}));

RichTextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  shared: PropTypes.bool,
  editorConfig: PropTypes.object,
};

RichTextInput.defaultProps = {
  value: DEFAULT_SAMPLE,
  onChange: () => { },
  disabled: false,
  shared: false,
};

