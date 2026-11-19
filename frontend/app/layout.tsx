import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner"
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
            <body className="h-full flex flex-col ">
                <QueryProvider>
                    {children}
                </QueryProvider>
                <Toaster position="top-right" richColors theme="light" toastOptions={{
                    className: "!text-base !px-5 !py-3",
                    style: {
                        fontSize: "15px",
                        minWidth: "400px",
                        minHeight: "72px",
                    },
                }} />
            </body>

        </html>
    );
}