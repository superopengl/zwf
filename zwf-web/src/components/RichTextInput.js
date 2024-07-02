import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { Typography, Skeleton, Button } from 'antd';
import { Editor } from '@tinymce/tinymce-react';

const { Paragraph, Text } = Typography

const DEFAULT_SAMPLE = ``;

export const RichTextInput = React.memo((props) => {

  const { value, disabled, onChange, placeholder, editorConfig } = props;
  const editorRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

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

  // tinymce.init({
  //   selector: 'textarea#full-featured-non-premium',
  //   plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
  //   imagetools_cors_hosts: ['picsum.photos'],
  //   menubar: 'file edit view insert format tools table help',
  //   toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
  //   toolbar_sticky: true,
  //   autosave_ask_before_unload: true,
  //   autosave_interval: "30s",
  //   autosave_prefix: "{path}{query}-{id}-",
  //   autosave_restore_when_empty: false,
  //   autosave_retention: "2m",
  //   image_advtab: true,
  //   content_css: '//www.tiny.cloud/css/codepen.min.css',
  //   link_list: [
  //     { title: 'My page 1', value: 'http://www.tinymce.com' },
  //     { title: 'My page 2', value: 'http://www.moxiecode.com' }
  //   ],
  //   image_list: [
  //     { title: 'My page 1', value: 'http://www.tinymce.com' },
  //     { title: 'My page 2', value: 'http://www.moxiecode.com' }
  //   ],
  //   image_class_list: [
  //     { title: 'None', value: '' },
  //     { title: 'Some class', value: 'class-name' }
  //   ],
  //   importcss_append: true,
  //   file_picker_callback: function (callback, value, meta) {
  //     /* Provide file and text for the link dialog */
  //     if (meta.filetype === 'file') {
  //       callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
  //     }

  //     /* Provide image and alt text for the image dialog */
  //     if (meta.filetype === 'image') {
  //       callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
  //     }

  //     /* Provide alternative source and posted for the media dialog */
  //     if (meta.filetype === 'media') {
  //       callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
  //     }
  //   },
  //   templates: [
  //         { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
  //     { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
  //     { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
  //   ],
  //   template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
  //   template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
  //   height: 520,
  //   image_caption: true,
  //   quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  //   noneditable_noneditable_class: "mceNonEditable",
  //   toolbar_mode: 'sliding',
  //   contextmenu: "link image imagetools table",
  //  });

  const handleEditorLoad = React.useCallback(() => {
    setReady(true)
  }, []);

  return (
    <>
      {!ready && <Skeleton active ></Skeleton>}

      <Editor
        // apiKey='3bmfxh7ddj07yqd2q0zicz9kckvcshqd1dwypp5tws9snpam'
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.js'}
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={value}
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
          images_upload_handler2: (blobInfo, success, failure, progress) => {
            const imageSize = blobInfo.blob().size;
            const maxSize = 1 * 1000 * 1000;
            if (imageSize > maxSize) {
              failure(`Image is too large. Maximum image size is ${maxSize / 1000 / 1000} MB`);
              return;
            }
            const uri = blobInfo.blobUri()
            success(uri);
            progress(100);
          },
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

