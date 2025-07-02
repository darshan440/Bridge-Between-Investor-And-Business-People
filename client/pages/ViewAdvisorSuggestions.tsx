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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Filter,
  Clock,
  User,
  ThumbsUp,
  Star,
  CheckCircle,
  TrendingUp,
  Eye,
  Bookmark,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for advisor suggestions
const mockSuggestions = [
  {
    id: 1,
    type: "Business Strategy",
    title: "Market Expansion Strategy for Your E-commerce Platform",
    advisor: "Rajesh Khanna",
    advisorTitle: "Senior Business Consultant",
    advisorRating: 4.8,
    content:
      "Based on your e-commerce business idea, I recommend focusing on tier-2 cities first. The competition is lower and customer acquisition costs are 40% cheaper. Start with 3-4 cities, build strong logistics partnerships, and then scale to metro areas. Also consider a mobile-first approach as 78% of tier-2 users shop via mobile.",
    category: "Growth Strategy",
    timestamp: "2 days ago",
    isBookmarked: false,
    helpful: true,
    views: 45,
    relatedTo: "E-commerce Platform Idea",
    tags: ["Market Research", "Expansion", "Mobile Commerce"],
    priority: "High",
  },
  {
    id: 2,
    type: "Funding Advice",
    title: "Alternative Funding Options for Tech Startups",
    advisor: "Priya Sharma",
    advisorTitle: "Venture Capital Expert",
    advisorRating: 4.9,
    content:
      "Instead of traditional VC funding, consider revenue-based financing for your SaaS idea. Companies like Lighter Capital or RevUp offer 2-12% of monthly revenue over 2-4 years. This maintains equity while providing growth capital. Also explore government schemes like SIDBI Fund of Funds and Startup India Seed Fund.",
    category: "Funding",
    timestamp: "3 days ago",
    isBookmarked: true,
    helpful: true,
    views: 78,
    relatedTo: "SaaS Platform Query",
    tags: ["Alternative Funding", "Revenue-Based", "Government Schemes"],
    priority: "High",
  },
  {
    id: 3,
    type: "Legal Advisory",
    title: "Intellectual Property Protection Strategy",
    advisor: "Amit Patel",
    advisorTitle: "Legal & IP Consultant",
    advisorRating: 4.7,
    content:
      "For your AI-based solution, file for patents early. Start with a provisional patent application (₹8,000) to establish priority date. File trademark for your brand name and logo. Consider trade secrets for algorithms. Register under Startup India for 80% rebate on patent fees. Timeline: 18-24 months for full patent.",
    category: "Legal",
    timestamp: "5 days ago",
    isBookmarked: false,
    helpful: true,
    views: 34,
    relatedTo: "AI Solution Idea",
    tags: ["Patents", "Trademarks", "IP Strategy"],
    priority: "Medium",
  },
  {
    id: 4,
    type: "Product Development",
    title: "MVP Development Framework for First-Time Entrepreneurs",
    advisor: "Neha Gupta",
    advisorTitle: "Product Management Expert",
    advisorRating: 4.6,
    content:
      "Build your MVP in 3 phases: 1) Core functionality only (8-12 weeks), 2) User feedback integration (4-6 weeks), 3) Market-ready version (6-8 weeks). Use no-code tools like Bubble or Webflow for rapid prototyping. Budget ₹2-5L for initial MVP. Focus on one key problem - avoid feature creep.",
    category: "Development",
    timestamp: "1 week ago",
    isBookmarked: true,
    helpful: false,
    views: 67,
    relatedTo: "Mobile App Idea",
    tags: ["MVP", "No-Code", "Product Strategy"],
    priority: "Medium",
  },
  {
    id: 5,
    type: "Marketing Strategy",
    title: "Digital Marketing for B2B SaaS - Cost-Effective Approaches",
    advisor: "Vikash Singh",
    advisorTitle: "Digital Marketing Strategist",
    advisorRating: 4.5,
    content:
      "Start with content marketing and SEO - 6 months to see results but highest ROI. Create weekly blog posts, LinkedIn articles, and video tutorials. Use tools like Ahrefs (₹15K/month) for keyword research. Budget ₹50K-1L monthly for paid ads initially. Focus on LinkedIn and Google Ads for B2B.",
    category: "Marketing",
    timestamp: "1 week ago",
    isBookmarked: false,
    helpful: true,
    views: 89,
    relatedTo: "B2B Platform Query",
    tags: ["Content Marketing", "SEO", "B2B Marketing"],
    priority: "Low",
  },
];

// Mock advisor stats
const advisorStats = [
  {
    name: "Rajesh Khanna",
    suggestions: 23,
    rating: 4.8,
    specialty: "Business Strategy",
  },
  { name: "Priya Sharma", suggestions: 18, rating: 4.9, specialty: "Funding" },
  { name: "Amit Patel", suggestions: 15, rating: 4.7, specialty: "Legal" },
];

export default function ViewAdvisorSuggestions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const categories = [
    "All Categories",
    "Business Strategy",
    "Funding",
    "Legal",
    "Marketing",
    "Product Development",
    "Operations",
    "Technology",
  ];

  const priorities = ["All Priorities", "High", "Medium", "Low"];

  const filteredSuggestions = mockSuggestions.filter((suggestion) => {
    const matchesSearch =
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.advisor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All Categories" ||
      suggestion.category === selectedCategory;
    const matchesPriority =
      !selectedPriority ||
      selectedPriority === "All Priorities" ||
      suggestion.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const toggleBookmark = (id: number) => {
    // Toggle bookmark logic would go here
    console.log("Toggle bookmark for suggestion", id);
  };

  const markHelpful = (id: number) => {
    // Mark as helpful logic would go here
    console.log("Mark helpful for suggestion", id);
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
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Advisor Suggestions
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
            Expert Advice & Suggestions
          </h1>
          <p className="text-gray-600">
            Personalized recommendations and insights from experienced business
            advisors to help grow your venture.
          </p>
        </div>

        <Tabs defaultValue="all-suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all-suggestions">All Suggestions</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="top-advisors">Top Advisors</TabsTrigger>
          </TabsList>

          <TabsContent value="all-suggestions" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search suggestions, advisors, or topics..."
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
                  <Select
                    value={selectedPriority}
                    onValueChange={setSelectedPriority}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredSuggestions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Suggestions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {mockSuggestions.filter((s) => s.helpful).length}
                  </div>
                  <div className="text-sm text-gray-600">Marked Helpful</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockSuggestions.filter((s) => s.isBookmarked).length}
                  </div>
                  <div className="text-sm text-gray-600">Bookmarked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-600">Active Advisors</div>
                </CardContent>
              </Card>
            </div>

            {/* Suggestions List */}
            <div className="space-y-6">
              {filteredSuggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <Badge
                          className={getPriorityColor(suggestion.priority)}
                        >
                          {suggestion.priority} Priority
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBookmark(suggestion.id)}
                          className={
                            suggestion.isBookmarked
                              ? "text-blue-600"
                              : "text-gray-400"
                          }
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight">
                      {suggestion.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{suggestion.advisor}</span>
                      </div>
                      <span>•</span>
                      <span>{suggestion.advisorTitle}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{suggestion.advisorRating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-900 leading-relaxed">
                        {suggestion.content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {suggestion.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{suggestion.timestamp}</span>
                        </div>
                        <span>•</span>
                        <span>Related to: {suggestion.relatedTo}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{suggestion.views} views</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={suggestion.helpful ? "default" : "outline"}
                          onClick={() => markHelpful(suggestion.id)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {suggestion.helpful ? "Helpful" : "Mark Helpful"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Ask Follow-up
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            {filteredSuggestions.length > 0 && (
              <div className="text-center">
                <Button variant="outline">Load More Suggestions</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked">
            <div className="space-y-6">
              {mockSuggestions
                .filter((s) => s.isBookmarked)
                .map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bookmark className="w-5 h-5 mr-2 text-blue-600" />
                        {suggestion.title}
                      </CardTitle>
                      <CardDescription>
                        By {suggestion.advisor} • {suggestion.timestamp}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{suggestion.content}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="top-advisors">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advisorStats.map((advisor) => (
                <Card
                  key={advisor.name}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle>{advisor.name}</CardTitle>
                    <CardDescription>{advisor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div className="flex justify-around">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {advisor.suggestions}
                        </div>
                        <div className="text-sm text-gray-600">Suggestions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {advisor.rating}
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                    </div>
                    <Button className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask Question
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
