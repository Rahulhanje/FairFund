"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Leaf, MapPin, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getFarmers } from "@/lib/blockchain"

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [filteredFarmers, setFilteredFarmers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFarmers = async () => {
      try {
        const farmersList = await getFarmers()
        // Enhance the mock data with more details for demo purposes
        const enhancedFarmers = farmersList.map((farmer, index) => ({
          ...farmer,
          id: index + 1,
          totalReceived: (Math.random() * 5).toFixed(2),
          image: `/placeholder.svg?height=200&width=200&text=${farmer.name.substring(0, 2)}`,
          story: `${farmer.name} is a dedicated farmer specializing in ${
            farmer.farmType
          }. With support from FairFund, ${
            Math.random() > 0.5 ? "he" : "she"
          } has been able to implement sustainable farming practices and increase crop yield.`,
        }))
        setFarmers(enhancedFarmers)
        setFilteredFarmers(enhancedFarmers)
      } catch (error) {
        console.error("Failed to load farmers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFarmers()
  }, [])

  useEffect(() => {
    // Filter farmers based on search term
    const filtered = farmers.filter(
      (farmer) =>
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.farmType.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort farmers based on sort criteria
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "location") {
        comparison = a.location.localeCompare(b.location)
      } else if (sortBy === "farmType") {
        comparison = a.farmType.localeCompare(b.farmType)
      } else if (sortBy === "totalReceived") {
        comparison = Number.parseFloat(a.totalReceived) - Number.parseFloat(b.totalReceived)
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredFarmers(sorted)
  }, [searchTerm, sortBy, sortOrder, farmers])

  const handleSort = (criteria: string) => {
    if (sortBy === criteria) {
      // Toggle sort order if clicking the same criteria
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new criteria and default to ascending
      setSortBy(criteria)
      setSortOrder("asc")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-700 mx-auto mb-4"></div>
          <p className="text-violet-900">Loading farmers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-violet-900 mb-4">Our Farmers</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Meet the hardworking farmers who are part of the FairFund ecosystem. Each farmer has been carefully selected
          based on their commitment to sustainable farming practices.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, address, location or farm type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Sort By
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Criteria</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("location")}>
              Location {sortBy === "location" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("farmType")}>
              Farm Type {sortBy === "farmType" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("totalReceived")}>
              Total Received {sortBy === "totalReceived" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredFarmers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No farmers found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFarmers.map((farmer) => (
            <Card key={farmer.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-violet-100 to-pink-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={farmer.image || "/placeholder.svg"}
                    alt={farmer.name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white"
                  />
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-violet-900">{farmer.name}</h3>
                  {farmer.isVerified && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center text-gray-500 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{farmer.location}</span>
                </div>

                <div className="flex items-center text-gray-500 mb-1">
                  <Leaf className="h-4 w-4 mr-1" />
                  <span className="text-sm">{farmer.farmType}</span>
                </div>

                <div className="flex items-center text-gray-500 mb-4">
                  <span className="text-xs">Address: {farmer.address}</span>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">{farmer.story}</p>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Total Received</p>
                    <p className="font-medium text-violet-900">{farmer.totalReceived} ETH</p>
                  </div>

                  <Button asChild variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
                    <Link href={`/farmers/${farmer.id}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
