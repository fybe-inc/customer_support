'use client';

import * as React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed left-0 w-64 h-screen bg-white border-r overflow-y-auto z-50 shadow-lg">
      <div className="p-4">
        <Link 
          href="/"
          className="block text-2xl font-bold mb-6 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ホーム
        </Link>
        <h2 className="text-xl font-bold mb-4">設定</h2>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/manual"
              className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              マニュアル管理
            </Link>
          </li>
          <li>
            <Link 
              href="/prompts"
              className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              事前シナリオ
            </Link>
          </li>
          <li>
            <Link 
              href="/products"
              className="block p-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              商品情報管理
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
