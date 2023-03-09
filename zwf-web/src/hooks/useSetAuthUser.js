import { GlobalContext } from 'contexts/GlobalContext';
import React from 'react';

export const useSetAuthUser = () => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;

  const setAuthUser = (user) => {
    setUser(user);
    if (user) {
      const { suspended } = user;
      if (suspended) {
        // TODO
      }
    }
  }

  return setAuthUser;
}