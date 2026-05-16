import type { Metadata } from 'next'
import '@xyflow/react/dist/style.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgentFlow — Visual IDE for multi-agent systems',
  description: 'Local-first open-source tool for designing multi-agent AI systems visually',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ height: '100vh', overflow: 'hidden' }}>{children}</body>
    </html>
  )
}
