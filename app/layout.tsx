import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moon Aura | 더 정확하고 더 다정하게",
  description: "계산은 정확하게, 해석은 다정하게. AI 사주 풀이 서비스 Moon Aura",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
