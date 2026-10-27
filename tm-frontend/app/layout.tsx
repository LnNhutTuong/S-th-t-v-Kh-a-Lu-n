import "./globals.css";

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