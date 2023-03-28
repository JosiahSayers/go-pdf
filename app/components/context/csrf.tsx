import { createContext, useContext } from 'react';

const csrfContext = createContext({ csrf: '' });

export const useCsrf = () => {
  const context = useContext(csrfContext);
  return context.csrf;
};

export const CsrfProvider = csrfContext.Provider;
