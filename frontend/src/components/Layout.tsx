'use client';

import React from 'react';
import Link from 'next/link';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-white border-r fixed h-screen overflow-y-auto">
        <div className="p-4">
          <Link href="/" className="block mb-8">
            <h2 className="text-xl font-bold">カスタマーサポート</h2>
          </Link>
          <h3 className="text-lg font-semibold mb-4">プロンプト設定</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/manual" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                マニュアル管理
              </Link>
            </li>
            <li>
              <Link href="/scenarios" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                プロンプト設定
              </Link>
            </li>
            <li>
              <Link href="/products" className="block p-2 text-gray-700 hover:bg-gray-100 rounded">
                商品情報管理
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="flex-1 ml-64 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
