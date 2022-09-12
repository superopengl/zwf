import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { Typography, Skeleton, Button } from 'antd';
import { Editor as TinymceReact } from '@tinymce/tinymce-react';

const { Paragraph, Text } = Typography

const DEFAULT_SAMPLE = ``;

export const RichTextInput = React.memo((props) => {

  const { value, disabled, onChange, placeholder, editorConfig } = props;
  const editorRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  const [initValue, setInitValue] = React.useState(value);

  React.useEffect(() => {
    return () => {
      editorRef?.current?.destroy();
    }
  }, [])

  const handleCustomImageInsert = (insertImgFn, result) => {
    const { id, fileName } = result;
    const url = `${API_BASE_URL}/file/${id}/data`;
    insertImgFn(url, fileName, url);
  }

  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const handleEditorLoad = () => {
    setReady(true)
  };

  return (
    <>
      {!ready && <Skeleton active ></Skeleton>}

      <TinymceReact
        // apiKey='3bmfxh7ddj07yqd2q0zicz9kckvcshqd1dwypp5tws9snpam'
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.js'}
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={initValue}
        onEditorChange={onChange}
        init={{
          height: 'calc(100vh - 340px)',
          plugins: 'importcss searchreplace autolink directionality visualblocks visualchars image link template table charmap nonbreaking anchor advlist lists quickbars autoresize',
          menubar: false, //'file edit view insert format tools table tc help',
          toolbar: 'blocks fontfamily fontsize  | bold italic underline strikethrough removeformat | blockquote superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent numlist bullist checklist forecolor backcolor | table',
          toolbar_sticky: true,
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
          toolbar_mode: 'wrap',
          branding: false,
          elementpath: false,
          statusbar: true,
          // contextmenu: 'table',
          paste_data_images: true,
          link_default_target: '_blank',
          link_default_protocol: 'https',
          image_title: false,
          file_picker_types: 'image',
          images_reuse_filename: true,
          automatic_uploads: true,
          // autoresize_bottom_margin: 100,
          onpageload: handleEditorLoad,
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
          ...editorConfig
        }}
      />
      {/* <Button onClick={log}>Log editor content</Button> */}
    </>
  );
});

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

