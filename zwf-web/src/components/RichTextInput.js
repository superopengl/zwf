import React from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from 'services/http';
import { extend } from 'wangeditor-for-react';
import i18next from 'i18next';
import { Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Paragraph, Text } = Typography

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

  return <>
    <Paragraph type="secondary">
      The variables embraced by double curly braces <Text code>{'{{'}</Text> and <Text code>{'}}'}</Text> will be replaced by corresponding field values. For example, text <Text code>{'{{Client Name}}'}</Text> will be replaced by the value of the field with name "Client Name". The variable replacement is <Text strong>case sensitive</Text>. So please make sure the variables specified in this doc template content are aligned with the field names when <Link to="/task_template">design task templates</Link>.
    </Paragraph>
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

