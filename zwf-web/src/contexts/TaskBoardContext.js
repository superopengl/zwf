import React from 'react';

export const defaultValue = {
  showClient: true,
  showTags: true,
};

export const TaskBoardContext = React.createContext(defaultValue);