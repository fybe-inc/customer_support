"use client";

export default function DebugFetch({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchapi = async () => {
    try {
      const response = await fetch("/api/healthcheck", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("認証が必要です。ログインしてください。");
        }
        throw new Error(
          `API request failed: ${data.error || response.statusText}`,
        );
      }
    } catch (error: unknown) {
      console.error("Error:", error);
    }
  };

  return <button onClick={fetchapi}>{children}</button>;
}
