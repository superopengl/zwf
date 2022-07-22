import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { extend } from 'wangeditor-for-react';
import i18next from 'i18next';
import { Typography, Skeleton, Button } from 'antd';
import { Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { Loading } from './Loading';

const { Paragraph, Text } = Typography

const ReactWEditor = extend({ i18next });

const DEFAULT_SAMPLE = ``;

export const RichTextInput = React.memo((props) => {

  const { value, disabled, onChange, shared } = props;
  const editorRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    return () => {
      editorRef?.current?.destroy();
    }
  }, [])

  React.useEffect(() => {
    console.log('redering')
  })

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
  });

  const handleChange =(content) => {  
    onChange(content)
  }

  return (
    <>
    {!ready && <Skeleton active ></Skeleton>}
    
      <Editor
        // apiKey='3bmfxh7ddj07yqd2q0zicz9kckvcshqd1dwypp5tws9snpam'
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.js'}
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={value}
        onEditorChange={handleChange}
        init={{
          height: 500,
          plugins: 'importcss searchreplace autolink directionality visualblocks visualchars image link template table charmap nonbreaking anchor insertdatetime advlist lists quickbars',
          menubar: false, //'file edit view insert format tools table tc help',
          toolbar: 'blocks fontfamily fontsize  | bold italic underline | strikethrough blockquote superscript subscript | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor removeformat | table image link',
          toolbar_sticky: true,
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
          toolbar_mode: 'wrap',
          branding: false,
          elementpath: false,
          statusbar : true,
          contextmenu: false,
          paste_data_images: true,
          onpageload: handleEditorLoad,
          images_upload_handler: (blobInfo, success, failure) => {
            success("data:" + blobInfo.blob().type + ";base64," + blobInfo.base64());
          },
        }}
      />
      <Button onClick={log}>Log editor content</Button>
    </>
  );

  return <>
    <ReactWEditor
      className="rich-editor"
      ref={editorRef}
      defaultValue={value}
      onChange={onChange}
      disabled={disabled}
      config={{
        lang: 'en',
        fontSizes: {
          'x-small': { name: '10px', value: '1' },
          small: { name: '12px', value: '2' },
          normal: { name: '14px', value: '3' },
          large: { name: '16px', value: '4' },
          'x-large': { name: '20px', value: '5' },
          'xx-large': { name: '24px', value: '6' },
          'xxx-large': { name: '32px', value: '7' },
        },
        height: "80%",
        // uploadImgServer: `${API_BASE_URL}/file${shared ? '?public=1' : ''}`,
        // uploadImgMaxLength: 1,
        uploadImgShowBase64: true,
        // withCredentials: true,
        // uploadFileName: 'file',
        // uploadImgTimeout: 30 * 1000, // 30 seconds
        // uploadImgHooks: {
        //   customInsert: handleCustomImageInsert
        // },
        showFullScreen: true,
        menus: [
          'head',
          'bold',
          // 'fontSize',
          // 'fontName',
          'italic',
          'underline',
          'strikeThrough',
          'indent',
          // 'lineHeight',
          // 'foreColor',
          // 'backColor',
          // 'link',
          'list',
          // 'todo',
          'justify',
          'quote',
          // 'emoticon',
          'image',
          // 'video',
          'table',
          // 'code',
          'splitLine',
          // 'undo',
          // 'redo',
        ]
      }}
    />
  </>
});

RichTextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  shared: PropTypes.bool,
};

RichTextInput.defaultProps = {
  value: DEFAULT_SAMPLE,
  onChange: () => { },
  disabled: false,
  shared: false,
};

