import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Filter,
  Clock,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Eye,
  MessageCircle,
  Calendar,
} from "lucide-react";

// Dummy data for business queries
const dummyQueries = [
  {
    id: "1",
    title: "How to validate a SaaS business idea before development?",
    description:
      "I have an idea for a project management SaaS tool but I'm not sure if there's enough market demand. What are the best ways to validate this idea before investing in development?",
    category: "Strategy & Planning",
    priority: "High",
    author: "Alex Kumar",
    authorType: "First-time Entrepreneur",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    status: "open",
    views: 45,
    responses: 3,
    budget: "₹5-10 Lakhs",
    timeline: "3-6 months",
    tags: ["SaaS", "Validation", "Market Research"],
    expertise: ["Product Management", "Market Research", "Strategy"],
    urgency: "Medium",
  },
  {
    id: "2",
    title: "Best practices for remote team management in a startup?",
    description:
      "Our startup has grown to 15 employees, all working remotely. We're struggling with communication, productivity tracking, and maintaining company culture. Looking for proven strategies.",
    category: "Human Resources",
    priority: "Medium",
    author: "Priya Sharma",
    authorType: "Growing Startup Founder",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    status: "open",
    views: 32,
    responses: 5,
    budget: "₹1-3 Lakhs",
    timeline: "1-2 months",
    tags: ["Remote Work", "Team Management", "Culture"],
    expertise: ["HR Management", "Leadership", "Operations"],
    urgency: "High",
  },
  {
    id: "3",
    title: "Funding options for a tech startup in India?",
    description:
      "We have a working MVP of our fintech app and some early traction. What are the best funding options available in India? Should we approach VCs, angel investors, or consider government schemes?",
    category: "Finance & Funding",
    priority: "High",
    author: "Rahul Gupta",
    authorType: "Tech Startup Founder",
    createdAt: "2024-01-14T09:15:00Z",
    updatedAt: "2024-01-14T12:30:00Z",
    status: "answered",
    views: 78,
    responses: 8,
    budget: "₹50 Lakhs - 2 Crores",
    timeline: "6-12 months",
    tags: ["Funding", "VC", "Angel Investment"],
    expertise: ["Finance", "Investment", "Legal"],
    urgency: "High",
  },
  {
    id: "4",
    title: "Digital marketing strategy for B2B services?",
    description:
      "We provide consulting services to mid-size companies but struggle with digital marketing. Our website traffic is low and lead generation is inconsistent. What strategies work best for B2B service businesses?",
    category: "Marketing & Sales",
    priority: "Medium",
    author: "Neha Patel",
    authorType: "Service Business Owner",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-13T18:20:00Z",
    status: "open",
    views: 25,
    responses: 2,
    budget: "₹2-5 Lakhs",
    timeline: "2-4 months",
    tags: ["B2B Marketing", "Lead Generation", "Digital Strategy"],
    expertise: ["Marketing", "Sales", "Content Strategy"],
    urgency: "Medium",
  },
  {
    id: "5",
    title: "Legal compliance for e-commerce startup?",
    description:
      "Starting an e-commerce platform that connects local artisans with customers. What are the key legal requirements, licenses, and compliance issues I need to address before launching?",
    category: "Legal & Compliance",
    priority: "High",
    author: "Amit Singh",
    authorType: "E-commerce Entrepreneur",
    createdAt: "2024-01-13T11:30:00Z",
    updatedAt: "2024-01-13T11:30:00Z",
    status: "open",
    views: 19,
    responses: 1,
    budget: "₹1-2 Lakhs",
    timeline: "1-3 months",
    tags: ["Legal", "E-commerce", "Compliance"],
    expertise: ["Legal", "E-commerce", "Regulatory"],
    urgency: "High",
  },
  {
    id: "6",
    title: "Scaling operations for a food delivery startup?",
    description:
      "Our food delivery app is successful in 2 cities. Now we want to expand to 5 more cities. What operational challenges should we prepare for and how can we scale efficiently?",
    category: "Operations Management",
    priority: "Medium",
    author: "Kavya Reddy",
    authorType: "Scale-up Founder",
    createdAt: "2024-01-12T13:15:00Z",
    updatedAt: "2024-01-12T15:45:00Z",
    status: "answered",
    views: 42,
    responses: 6,
    budget: "₹10-20 Lakhs",
    timeline: "6-9 months",
    tags: ["Scaling", "Operations", "Food Delivery"],
    expertise: ["Operations", "Logistics", "Strategy"],
    urgency: "Medium",
  },
];

const ViewQueries: React.FC = () => {
  const [queries, setQueries] = useState(dummyQueries);
  const [filteredQueries, setFilteredQueries] = useState(dummyQueries);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const categories = [
    "Finance & Funding",
    "Marketing & Sales",
    "Operations Management",
    "Human Resources",
    "Technology",
    "Legal & Compliance",
    "Strategy & Planning",
  ];

  useEffect(() => {
    filterQueries();
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedPriority,
    activeTab,
  ]);

  const filterQueries = () => {
    let filtered = dummyQueries;

    // Filter by tab
    if (activeTab === "open") {
      filtered = filtered.filter((q) => q.status === "open");
    } else if (activeTab === "answered") {
      filtered = filtered.filter((q) => q.status === "answered");
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((q) => q.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((q) => q.priority === selectedPriority);
    }

    setFilteredQueries(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "answered":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "High":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "Medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Business Queries
              </h1>
              <p className="text-gray-600">
                Help entrepreneurs with your expertise
              </p>
            </div>
          </div>
          <Link to="/post-solution">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Answer Query
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All Queries ({dummyQueries.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({dummyQueries.filter((q) => q.status === "open").length})
            </TabsTrigger>
            <TabsTrigger value="answered">
              Answered (
              {dummyQueries.filter((q) => q.status === "answered").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredQueries.length > 0 ? (
              <div className="space-y-6">
                {filteredQueries.map((query) => (
                  <Card
                    key={query.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getUrgencyIcon(query.urgency)}
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {query.title}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {query.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Badge className={getPriorityColor(query.priority)}>
                            {query.priority} Priority
                          </Badge>
                          <Badge className={getStatusColor(query.status)}>
                            {query.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Query Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Budget Range</p>
                          <p className="font-medium">{query.budget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Timeline</p>
                          <p className="font-medium">{query.timeline}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-medium">{query.category}</p>
                        </div>
                      </div>

                      {/* Tags and Expertise Needed */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-sm text-gray-600 mr-2">
                            Tags:
                          </span>
                          {query.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-600 mr-2">
                            Expertise Needed:
                          </span>
                          {query.expertise.map((exp) => (
                            <Badge
                              key={exp}
                              variant="outline"
                              className="text-xs"
                            >
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Query Meta */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{query.author}</span>
                            <span>•</span>
                            <span>{query.authorType}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{getTimeAgo(query.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{query.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{query.responses}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {query.status === "open" && (
                              <Button size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Answer Query
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Queries Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ||
                    selectedCategory !== "all" ||
                    selectedStatus !== "all"
                      ? "Try adjusting your filters to see more queries."
                      : "No business queries are available at the moment."}
                  </p>
                  {searchTerm ||
                  selectedCategory !== "all" ||
                  selectedStatus !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedStatus("all");
                        setSelectedPriority("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Check back later for new queries from entrepreneurs.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ViewQueries;
