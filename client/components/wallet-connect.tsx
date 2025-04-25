"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
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
  const [balance, setBalance] = useState<string | null>(null)
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
          if (account) {
            await fetchBalance(account)
          }
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

  const fetchBalance = async (account: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance)) // Convert balance to Ether
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const account = await connectWallet()
      setAddress(account)
      setIsOwner(isAccountOwner())
      if (account) {
        await fetchBalance(account)
      }
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
    setAddress(null)
    setBalance(null)
    setIsOwner(false)
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from this app.",
    })
    
    if (onDisconnect) {
      onDisconnect()
    }
  }

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
      {address && balance && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Balance: {balance} ETH
        </div>
      )}
    </div>
  )
}