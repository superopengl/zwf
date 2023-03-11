import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from './useRole';

export const useRoleAssertion = (allowedRole, fallbackPath =  '/') => {
  const role = useRole();
  const navigate = useNavigate();

  if(!allowedRole?.length) {
    throw new Error(`allowedRole is not specified`);
  }
  
  React.useEffect(() => {
    if(!allowedRole.includes(role)) {
      navigate(fallbackPath)
    }
  }, [])

  return null;
}