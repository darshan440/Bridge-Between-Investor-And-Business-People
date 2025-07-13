import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Eye,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ContactCard, extractContactInfo } from "@/components/ContactCard";

// Mock data for business proposals
const mockProposals = [
  {
    id: 1,
    title: "AI-Powered Healthcare Diagnosis Platform",
    category: "Healthcare",
    description:
      "Revolutionary AI platform that assists doctors in faster and more accurate diagnosis using machine learning algorithms.",
    budget: "₹25,00,000",
    timeline: "1-2 years",
    founder: "Dr. Priya Sharma",
    team: "5 members",
    rating: 4.8,
    views: 234,
    interested: 12,
    tags: ["AI", "Healthcare", "B2B"],
    authorProfile: {
      uid: "user1",
      fullName: "Dr. Priya Sharma",
      email: "priya.sharma@example.com",
      role: "business_person" as const,
      mobileNumber: "+91 9876543210",
      companyName: "MedTech Innovations",
      designation: "Founder & CEO",
      isComplete: true,
    },
    featured: true,
  },
  {
    id: 2,
    title: "Sustainable Food Delivery Network",
    category: "Food & Beverage",
    description:
      "Eco-friendly food delivery service using electric vehicles and sustainable packaging to reduce environmental impact.",
    budget: "₹15,00,000",
    timeline: "6-12 months",
    founder: "Rahul Gupta",
    team: "3 members",
    rating: 4.5,
    views: 189,
    interested: 8,
    tags: ["Sustainability", "Food Tech", "B2C"],
    featured: false,
  },
  {
    id: 3,
    title: "EdTech Platform for Rural Education",
    category: "Education",
    description:
      "Digital learning platform specifically designed for rural areas with offline capabilities and local language support.",
    budget: "₹18,00,000",
    timeline: "1-2 years",
    founder: "Anita Verma",
    team: "4 members",
    rating: 4.7,
    views: 156,
    interested: 15,
    tags: ["EdTech", "Rural", "Social Impact"],
    featured: true,
  },
  {
    id: 4,
    title: "Blockchain Supply Chain Solution",
    category: "Technology",
    description:
      "Transparent supply chain management system using blockchain technology for better traceability and authenticity.",
    budget: "₹30,00,000",
    timeline: "2-3 years",
    founder: "Arjun Patel",
    team: "6 members",
    rating: 4.6,
    views: 298,
    interested: 20,
    tags: ["Blockchain", "Supply Chain", "B2B"],
    featured: false,
  },
  {
    id: 5,
    title: "Smart Agriculture IoT Platform",
    category: "Agriculture",
    description:
      "IoT-based platform for precision farming with sensors, automation, and data analytics to optimize crop yields.",
    budget: "₹22,00,000",
    timeline: "1-2 years",
    founder: "Vikash Singh",
    team: "5 members",
    rating: 4.4,
    views: 167,
    interested: 9,
    tags: ["IoT", "Agriculture", "Smart Farming"],
    featured: false,
  },
];

export default function ViewProposals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");

  const categories = [
    "All Categories",
    "Technology",
    "Healthcare",
    "Education",
    "E-commerce",
    "Food & Beverage",
    "Agriculture",
    "Finance",
  ];

  const budgetRanges = [
    "All Budgets",
    "Under ₹10L",
    "₹10L - ₹20L",
    "₹20L - ₹50L",
    "Above ₹50L",
  ];

  const filteredProposals = mockProposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All Categories" ||
      proposal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Investment Opportunities
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Investment Opportunities
          </h1>
          <p className="text-gray-600">
            Browse through curated business proposals and find your next
            investment opportunity.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search business ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredProposals.length}
              </div>
              <div className="text-sm text-gray-600">Active Proposals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">₹180L</div>
              <div className="text-sm text-gray-600">Total Funding Sought</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">45</div>
              <div className="text-sm text-gray-600">Interested Investors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600">Funded This Month</div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <Card
              key={proposal.id}
              className="hover:shadow-lg transition-shadow relative"
            >
              {proposal.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">{proposal.category}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{proposal.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {proposal.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {proposal.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {proposal.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{proposal.budget}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{proposal.timeline}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>{proposal.team}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span>{proposal.views} views</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">
                      By {proposal.founder}
                    </span>
                    <span className="text-sm text-gray-500">
                      {proposal.interested} interested
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredProposals.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Proposals</Button>
          </div>
        )}

        {/* No Results */}
        {filteredProposals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No proposals found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new
                opportunities.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
