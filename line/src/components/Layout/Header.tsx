"use client";

import Link from "next/link";
import { Logout } from "../auth/Logout";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  // "/" または "/[id]"（例: /1234 など）にいる場合はチャットをハイライト
  const isManualActive = pathname === "/manuals";
  const isChatActive = pathname === "/chats";
  const isPrecedentActive = pathname === "/precedents";
  const isProductActive = pathname === "/products";
  const isScenarioActive = pathname === "/scenarios";
  return (
    <header className="flex justify-between items-center p-4 sticky top-0">
      <div className="flex gap-4">
        <Link href="/chats" className={isChatActive ? "text-blue-500 font-bold" : undefined}>チャット</Link>
        <Link href="/manuals" className={isManualActive ? "text-blue-500 font-bold" : undefined}>マニュアル</Link>
        <Link href="/precedents" className={isPrecedentActive ? "text-blue-500 font-bold" : undefined}>過去の例</Link>
        <Link href="/products" className={isProductActive ? "text-blue-500 font-bold" : undefined}>商品</Link>
        <Link href="/scenarios" className={isScenarioActive ? "text-blue-500 font-bold" : undefined}>シナリオ</Link>
      </div>
      <Logout />
    </header>
  );
}
