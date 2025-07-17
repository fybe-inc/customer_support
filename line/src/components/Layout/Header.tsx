'use client';

import Link from "next/link";
import { Logout } from "../auth/Logout";
import { useState, createContext, useContext } from "react";

interface HeaderContextType {
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTitle, setHeaderTitle] = useState<string>("");
  
  return (
    <HeaderContext.Provider value={{ headerTitle, setHeaderTitle }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({children}:HeaderProps) {
  const {headerTitle} = useHeader();
  
  return (
    <>
    <div className="flex justify-between items-center p-4 sticky top-0">
        <h1>{headerTitle}</h1>
      <div className="flex items-center gap-4">
        <Link href="/">Home</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/profile">Profile</Link>
        <Logout />
      </div>
    </div>
    {children}
    </>
  );
}
