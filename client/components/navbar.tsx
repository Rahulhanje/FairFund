"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import WalletConnect from "@/components/wallet-connect"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { name: "Home", path: "/" },
    { name: "Farmers", path: "/farmers" },
    { name: "Donors", path: "/donors" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "About", path: "/about" },
  ]

  const isActive = (path: string) => pathname === path

  return (
<header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-sm">
<div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-violet-600",
                      isActive(route.path) ? "text-violet-600" : "text-muted-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.name}
                  </Link>
                ))}
                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
                    <Link href="/register">Register</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-pink-500 text-transparent bg-clip-text">
              FairFund
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-violet-600",
                isActive(route.path) ? "text-violet-600" : "text-muted-foreground",
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}

          <div className="hidden lg:flex items-center gap-2">
            <WalletConnect variant="outline" />
                
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
