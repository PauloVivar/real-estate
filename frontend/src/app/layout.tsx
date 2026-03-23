import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VIVARQ HOME - Generador de Contenido Inmobiliario',
  description:
    'Genera descripciones profesionales y copies de Instagram para tus propiedades con IA'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500 text-white font-bold text-xl px-3 py-1 rounded-lg">
                VH
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VIVARQ HOME</h1>
                <p className="text-xs text-gray-500">
                  Generador de Contenido Inmobiliario con IA
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center py-6 text-sm text-gray-400">
          VIVARQ HOME &copy; {new Date().getFullYear()} — by{' '}
          <a
            href="https://paulo-vivar.vercel.app"
            className="text-primary-500 hover:underline"
          >
            Vivaring Corp.
          </a>
        </footer>
      </body>
    </html>
  )
}
