"use client"

import React, { useState } from 'react'
import Sidebar from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white shadow-md"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex flex-col h-full w-full">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
