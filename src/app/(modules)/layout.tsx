export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body>
                <header>
                    <h1>Sistema de Gestão de Clientes</h1>
                </header>
                {children}
            </body>
        </html>
    )
}