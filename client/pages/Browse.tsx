import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  TrendingUp,
  Lightbulb,
  Search,
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  MapPin,
} from "lucide-react";

const mockBusinessIdeas = [
  {
    id: 1,
    title: "AI-Powered Food Delivery Optimization",
    description:
      "Revolutionary algorithm to optimize food delivery routes and reduce waiting times by 40%.",
    category: "Technology",
    funding: "₹50 Lakhs",
    location: "Bangalore",
    postedDate: "2 days ago",
    views: 234,
    status: "Seeking Investment",
  },
  {
    id: 2,
    title: "Sustainable Packaging Solutions",
    description:
      "Eco-friendly packaging made from agricultural waste, targeting e-commerce companies.",
    category: "Sustainability",
    funding: "₹25 Lakhs",
    location: "Mumbai",
    postedDate: "1 week ago",
    views: 156,
    status: "Active",
  },
  {
    id: 3,
    title: "Digital Health Monitoring Platform",
    description:
      "IoT-based health monitoring system for elderly patients with family connectivity features.",
    category: "Healthcare",
    funding: "₹75 Lakhs",
    location: "Delhi",
    postedDate: "3 days ago",
    views: 189,
    status: "Seeking Investment",
  },
  {
    id: 4,
    title: "Smart Farming Irrigation System",
    description:
      "Automated irrigation system using weather data and soil sensors to optimize water usage.",
    category: "Agriculture",
    funding: "₹30 Lakhs",
    location: "Pune",
    postedDate: "5 days ago",
    views: 167,
    status: "Pre-Launch",
  },
];

const categories = [
  { name: "All", count: 234, active: true },
  { name: "Technology", count: 89, active: false },
  { name: "Healthcare", count: 45, active: false },
  { name: "Sustainability", count: 34, active: false },
  { name: "Agriculture", count: 28, active: false },
  { name: "Finance", count: 22, active: false },
  { name: "Education", count: 16, active: false },
];

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredIdeas = mockBusinessIdeas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || idea.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      Healthcare: "bg-green-100 text-green-800",
      Sustainability: "bg-emerald-100 text-emerald-800",
      Agriculture: "bg-yellow-100 text-yellow-800",
      Finance: "bg-purple-100 text-purple-800",
      Education: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Browse Opportunities
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search business ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {filteredIdeas.length} opportunities found
              </span>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="h-8"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Business Ideas Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    <Badge className={getCategoryColor(idea.category)}>
                      {idea.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-3">
                  {idea.description}
                </CardDescription>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{idea.funding}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{idea.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{idea.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{idea.postedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge
                    variant={
                      idea.status === "Seeking Investment"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs"
                  >
                    {idea.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filters to find more business ideas.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Want to do more?</CardTitle>
            <CardDescription className="text-blue-700">
              Upgrade your role to unlock advanced features like investing,
              posting business ideas, or providing expert advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Role
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
