import { createContext, useContext } from 'react';

interface UserInfo {
  id: string;
  name: string;
}

const userContext = createContext<UserInfo | null>(null);

export const useUser = () => {
  const context = useContext(userContext);
  return context;
};

export const UserProvider = userContext.Provider;
