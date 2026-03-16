import type { Metadata } from "next";
import {
  Special_Elite,
  Courier_Prime,
  Noto_Serif_SC,
  Noto_Sans_SC,
  Ma_Shan_Zheng,
  Black_Ops_One,
  ZCOOL_XiaoWei,
} from "next/font/google";
import LocaleProvider from "@/components/LocaleProvider";
import "./globals.css";

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif-cn",
  display: "swap",
  preload: false,
});

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-sans-cn",
  display: "swap",
  preload: false,
});

const zcoolXiaoWei = ZCOOL_XiaoWei({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title-cn",
  display: "swap",
  preload: false,
});

const maShanZheng = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-handwritten",
  display: "swap",
  preload: false,
});

const blackOpsOne = Black_Ops_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-stamp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OPERATION KABOOM | Missile Force Attrition Simulator",
  description:
    "A totally fictional Monte Carlo war-gaming simulator. For educational purposes only. Probably.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${specialElite.variable}
          ${courierPrime.variable}
          ${notoSerifSC.variable}
          ${notoSansSC.variable}
          ${zcoolXiaoWei.variable}
          ${maShanZheng.variable}
          ${blackOpsOne.variable}
          antialiased
        `}
      >
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
