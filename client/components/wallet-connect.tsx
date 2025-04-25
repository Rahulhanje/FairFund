"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { connectWallet, isWalletConnected, getCurrentAccount, isAccountOwner } from "@/lib/blockchain"
import { useToast } from "@/hooks/use-toast"
import { Wallet, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WalletConnectProps {
  onConnect?: (address: string) => void
  onDisconnect?: () => void
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function WalletConnect({
  onConnect,
  onDisconnect,
  variant = "default",
  size = "default",
  className,
}: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isWalletConnected()
        if (connected) {
          const account = getCurrentAccount()
          setAddress(account)
          setIsOwner(isAccountOwner())
          if (onConnect && account) {
            onConnect(account)
          }
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    checkConnection()
  }, [onConnect])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const account = await connectWallet()
      setAddress(account)
      setIsOwner(isAccountOwner())
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been connected successfully.",
      })
      if (onConnect) {
        onConnect(account)
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    // Note: MetaMask doesn't have a true disconnect method through their API
    // The best approach is to clear the local state
    setAddress(null)
    setIsOwner(false)
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from this app.",
    })
    
    if (onDisconnect) {
      onDisconnect()
    }
    
    // Optional: Reload the page to ensure a clean state
    // window.location.reload()
  }

  // Format address to show first char and last 4 chars
  const formatShortAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <div className="flex items-center gap-2">
      {!address ? (
        <Button
          onClick={handleConnect}
          variant={variant}
          size={size}
          className={className}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size={size}
          className={`${className} ${isOwner ? "text-green-600 dark:text-green-400" : ""}`}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {formatShortAddress(address)}
          <LogOut className="h-3 w-3 ml-2" />
        </Button>
      )}
      {isOwner && address && (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Owner</Badge>
      )}
    </div>
  )
}