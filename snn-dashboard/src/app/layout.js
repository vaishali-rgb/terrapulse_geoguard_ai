// GeoGuard AI Platform - layout.js 
// Maintained by Team PFL
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-main' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'GeoGuard AI | Agentic Geospatial Compliance Dashboard',
  description: 'AI-powered satellite imagery analysis for compliance monitoring.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  )
}
