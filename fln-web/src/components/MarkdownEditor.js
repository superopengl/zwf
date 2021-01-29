import React from 'react';
import PropTypes from 'prop-types';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import { uploadFile } from 'services/http';

const mdParser = new MarkdownIt({ html: true, linkify: true });

export const MarkdownEditor = props => {
  const { value, style, onChange } = props;

  const handleChange = e => {
    onChange(e.text);
  }

  const onImageUpload = async (imageBlob) => {
    const file = await uploadFile(imageBlob);
    return file.location;
  }

  return <MdEditor
    value={value}
    style={style}
    renderHTML={(text) => mdParser.render(text)}
    onChange={handleChange}
    onImageUpload={onImageUpload}
  />
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  style: PropTypes.object
};

MarkdownEditor.defaultProps = {
};

export default MarkdownEditor;
