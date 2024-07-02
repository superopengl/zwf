import React from 'react';
import { RichTextInput } from './RichTextInput';

const CONFIG = {
  toolbar: 'bold italic underline strikethrough blockquote numlist bullist checklist removeformat',
  automatic_uploads: false,
  statusbar: false,
  height: '4rem',
  contextmenu: false,
};

export const MessageInput = (props) => {
  return (
    <RichTextInput editorConfig={CONFIG} {...props}/>
  );
};

MessageInput.propTypes = {
};

MessageInput.defaultProps = {
};

