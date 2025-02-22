'use client';

import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="w-64 min-h-screen bg-white border-r">
      <div className="p-4">
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
              プロンプト設定
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
