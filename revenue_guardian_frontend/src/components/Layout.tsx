// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            {/* The ml-64 creates space for the 64-width sidebar */}
            <div className="flex-1 ml-64 flex flex-col overflow-auto"> 
                <Header />
                <main className="p-6 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;