import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Wallet } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DonorsPage() {
  // Sample donors data
  const donors = [
    {
      id: 1,
      name: "Acme Foundation",
      description:
        "Supporting sustainable agriculture worldwide with a focus on water conservation and organic farming methods.",
      totalDonated: 5.75,
      successfulDisbursements: 12,
      isVerified: true,
      reputationScore: 85,
      image: "/placeholder.svg?height=200&width=200&text=AF",
    },
    {
      id: 2,
      name: "Green Future Initiative",
      description:
        "Promoting eco-friendly farming practices and supporting farmers transitioning to sustainable methods.",
      totalDonated: 3.2,
      successfulDisbursements: 8,
      isVerified: true,
      reputationScore: 92,
      image: "/placeholder.svg?height=200&width=200&text=GF",
    },
    {
      id: 3,
      name: "Global Harvest Fund",
      description:
        "Investing in small-scale farmers across developing nations to improve food security and economic stability.",
      totalDonated: 8.1,
      successfulDisbursements: 15,
      isVerified: true,
      reputationScore: 78,
      image: "/placeholder.svg?height=200&width=200&text=GH",
    },
    {
      id: 4,
      name: "AgriTech Ventures",
      description: "Supporting technological innovation in agriculture to increase efficiency and sustainability.",
      totalDonated: 2.5,
      successfulDisbursements: 5,
      isVerified: false,
      reputationScore: 70,
      image: "/placeholder.svg?height=200&width=200&text=AT",
    },
    {
      id: 5,
      name: "Sustainable Futures",
      description: "Focused on long-term agricultural sustainability and building resilient farming communities.",
      totalDonated: 4.3,
      successfulDisbursements: 10,
      isVerified: true,
      reputationScore: 88,
      image: "/placeholder.svg?height=200&width=200&text=SF",
    },
    {
      id: 6,
      name: "Rural Development Trust",
      description:
        "Dedicated to improving rural livelihoods through sustainable agriculture and community development.",
      totalDonated: 6.2,
      successfulDisbursements: 14,
      isVerified: true,
      reputationScore: 90,
      image: "/placeholder.svg?height=200&width=200&text=RD",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-violet-900 mb-4">Our Donors</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Meet the organizations and individuals who are making a difference by supporting small farmers through the
          FairFund platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {donors.map((donor) => (
          <Card key={donor.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-violet-100 to-pink-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={donor.image || "/placeholder.svg"}
                  alt={donor.name}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white"
                />
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-violet-900">{donor.name}</h3>
                {donor.isVerified && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center text-gray-500 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span className="text-sm font-medium">{donor.reputationScore}/100</span>
                </div>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-1 text-violet-500" />
                  <span className="text-sm">{donor.successfulDisbursements} Disbursements</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 line-clamp-3">{donor.description}</p>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Total Donated</p>
                  <p className="font-medium text-violet-900">{donor.totalDonated} ETH</p>
                </div>

                <Button asChild variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50">
                  <Link href={`/donors/${donor.id}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
