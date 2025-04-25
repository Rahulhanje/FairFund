"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { registerDonor, registerFarmer, isWalletConnected } from "@/lib/blockchain"
import { Leaf, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import WalletConnect from "@/components/wallet-connect"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("type") === "farmer" ? "farmer" : "donor"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Donor form state
  const [donorForm, setDonorForm] = useState({
    name: "",
    description: "",
  })

  // Farmer form state
  const [farmerForm, setFarmerForm] = useState({
    name: "",
    location: "",
    farmType: "",
  })

  useEffect(() => {
    const checkWalletConnection = async () => {
      const connected = await isWalletConnected()
      setIsConnected(connected)
    }

    checkWalletConnection()
  }, [])

  const handleWalletConnect = (address: string) => {
    setIsConnected(true)
    toast({
      title: "Wallet Connected",
      description: "Your wallet has been connected successfully.",
    })
  }

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await registerDonor(donorForm.name, donorForm.description)
      toast({
        title: "Registration Successful",
        description: "You have been registered as a donor.",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register as donor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFarmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await registerFarmer(farmerForm.name, farmerForm.location, farmerForm.farmType)
      toast({
        title: "Registration Successful",
        description: "You have been registered as a farmer.",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register as farmer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-violet-900">Register with FairFund</h1>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>Connect your Ethereum wallet to register as a donor or farmer.</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect onConnect={handleWalletConnect} className="w-full bg-violet-600 hover:bg-violet-700" />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="donor"
                className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Donor
              </TabsTrigger>
              <TabsTrigger value="farmer" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-900">
                <Leaf className="mr-2 h-4 w-4" />
                Farmer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donor">
              <Card>
                <CardHeader>
                  <CardTitle>Register as Donor</CardTitle>
                  <CardDescription>Fill in your details to register as a donor on FairFund.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDonorSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="donor-name">Organization Name</Label>
                      <Input
                        id="donor-name"
                        placeholder="Enter your organization name"
                        value={donorForm.name}
                        onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="donor-description">Description</Label>
                      <Textarea
                        id="donor-description"
                        placeholder="Describe your organization and mission"
                        value={donorForm.description}
                        onChange={(e) => setDonorForm({ ...donorForm, description: e.target.value })}
                        required
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Register as Donor"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="farmer">
              <Card>
                <CardHeader>
                  <CardTitle>Register as Farmer</CardTitle>
                  <CardDescription>Fill in your details to register as a farmer on FairFund.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFarmerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmer-name">Full Name</Label>
                      <Input
                        id="farmer-name"
                        placeholder="Enter your full name"
                        value={farmerForm.name}
                        onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="farmer-location">Location</Label>
                      <Input
                        id="farmer-location"
                        placeholder="Enter your farm location"
                        value={farmerForm.location}
                        onChange={(e) => setFarmerForm({ ...farmerForm, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="farmer-type">Farm Type</Label>
                      <Input
                        id="farmer-type"
                        placeholder="E.g., Organic, Traditional, etc."
                        value={farmerForm.farmType}
                        onChange={(e) => setFarmerForm({ ...farmerForm, farmType: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
                      {isLoading ? "Registering..." : "Register as Farmer"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
