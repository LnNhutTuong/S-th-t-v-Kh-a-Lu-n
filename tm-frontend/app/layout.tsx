import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <html
            suppressHydrationWarning
            lang="en"
            className="h-full antialiased"
        >
            <body className={`h-full flex flex-col`} >
                {children}
            </body>
        </html>
    );
}