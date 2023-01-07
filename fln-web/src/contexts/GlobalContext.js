import React from 'react';

export const defaultGlobalContext = {
  user: null,
  role: 'guest',
  loading: false,
  setUser: () => {},
};

export const GlobalContext = React.createContext(defaultGlobalContext);