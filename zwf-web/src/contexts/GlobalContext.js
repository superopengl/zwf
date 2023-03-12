import React from 'react';

export const defaultGlobalContext = {
  user: null,
  role: 'guest',
  loading: false,
};

export const GlobalContext = React.createContext(defaultGlobalContext);