
export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen overflow-y-auto scrollbar-hide">
            
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}