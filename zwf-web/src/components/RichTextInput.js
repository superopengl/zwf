import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { extend } from 'wangeditor-for-react';
import i18next from 'i18next';

const ReactWEditor = extend({ i18next });

const DEFAULT_SAMPLE = ``;

export const RichTextInput = (props) => {

  const { value, disabled, onChange, shared } = props;
  let editorRef = React.useRef(null);

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

  return <ReactWEditor
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
      uploadImgServer: `${API_BASE_URL}/file${shared ? '?public=1' : ''}`,
      uploadImgMaxLength: 1,
      withCredentials: true,
      uploadFileName: 'file',
      uploadImgTimeout: 20 * 1000, // 20 seconds
      uploadImgHooks: {
        customInsert: handleCustomImageInsert
      },
      menus: [
        'head',
        'bold',
        // 'fontSize',
        // 'fontName',
        'italic',
        'underline',
        'strikeThrough',
        'indent',
        'lineHeight',
        'foreColor',
        'backColor',
        'link',
        'list',
        'todo',
        'justify',
        'quote',
        // 'emoticon',
        'image',
        // 'video',
        'table',
        'code',
        'splitLine',
        // 'undo',
        // 'redo',
      ]
    }}
  />
};

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

