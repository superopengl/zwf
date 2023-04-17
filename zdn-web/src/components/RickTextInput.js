import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import loadable from '@loadable/component'
import 'suneditor/dist/css/suneditor.min.css';

const SunEditor = loadable(() => import('suneditor-react'));

const DEFAULT_SAMPLE = ``;

const RickTextInput = (props) => {

  const {ref, value, disabled, onChange} = props;

  return (
    <SunEditor ref={ref}
      showToolbar={true}
      enableToolbar={true}
      setDefaultStyle="font-size: 14px;"
      setOptions={{
        // https://github.com/JiHong88/SunEditor/blob/master/README.md#options
        minHeight: '300px',
        buttonList: [
          ['undo', 'redo'],
          ['font', 'fontSize', 'formatBlock'],
          ['bold', 'underline', 'italic', 'strike', 'blockquote', 'subscript', 'superscript'],
          ['fontColor', 'hiliteColor'],
          ['removeFormat'],
          ['list', 'outdent', 'indent'],
          ['align'],
          ['horizontalRule', 'table', 'link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin.
          // ['imageGallery'], // You must add the "imageGalleryUrl".
          // ['fullScreen']
        ],
        showPathLabel: false,
      }}
      onChange={onChange}
      setContents={value}
      disable={disabled}
    />
  );
};

RickTextInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

RickTextInput.defaultProps = {
  value: DEFAULT_SAMPLE,
  onChange: () => { },
  disabled: false,
};

export default withRouter(RickTextInput);
