import './globals.css'
import Header from '../components/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shimanami Workspaces',
  description: '今治・しまなみ海道のワーク拠点検索',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-transparent text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  )
}
