import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for user's queries and responses
const mockUserQueries = [
  {
    id: 1,
    title: "How to scale my e-commerce business?",
    description:
      "I've been running a small online clothing store for 6 months. Sales are steady but I want to scale to the next level. What strategies should I focus on?",
    category: "Business Strategy",
    priority: "High",
    status: "answered",
    askedOn: "3 days ago",
    responses: 4,
    views: 123,
    upvotes: 8,
  },
  {
    id: 2,
    title: "Best payment gateways for Indian startups?",
    description:
      "Looking for reliable and cost-effective payment gateway solutions for my fintech startup. Any recommendations?",
    category: "Technology",
    priority: "Medium",
    status: "open",
    askedOn: "1 week ago",
    responses: 2,
    views: 89,
    upvotes: 3,
  },
  {
    id: 3,
    title: "How to hire remote developers effectively?",
    description:
      "My startup needs to hire remote developers but I'm not sure about the best practices for remote hiring and management.",
    category: "Team Building",
    priority: "Medium",
    status: "answered",
    askedOn: "2 weeks ago",
    responses: 6,
    views: 156,
    upvotes: 12,
  },
];

// Mock responses for a query
const mockResponses = [
  {
    id: 1,
    advisor: "Rajesh Khanna",
    title: "Senior Business Consultant",
    response:
      "Based on my 15 years of experience in e-commerce, I'd recommend focusing on these key areas: 1) Customer retention through email marketing and loyalty programs, 2) Expanding your product line based on sales data, 3) Investing in SEO and content marketing for organic growth, 4) Consider partnerships with complementary brands.",
    timestamp: "2 days ago",
    upvotes: 15,
    helpful: true,
  },
  {
    id: 2,
    advisor: "Priya Sharma",
    title: "E-commerce Growth Expert",
    response:
      "Great question! For scaling e-commerce, I always tell my clients to focus on data first. Set up proper analytics, understand your customer acquisition cost, and identify your most profitable products. Then double down on what's working. Also, consider marketplace expansion - Amazon, Flipkart can significantly boost your reach.",
    timestamp: "1 day ago",
    upvotes: 8,
    helpful: true,
  },
];

export default function QueryPanel() {
  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
  });
  const [selectedQueryId, setSelectedQueryId] = useState<number | null>(null);

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New query submitted:", newQuery);
    // Reset form
    setNewQuery({
      title: "",
      description: "",
      category: "",
      priority: "Medium",
    });
  };

  const categories = [
    "Business Strategy",
    "Funding",
    "Technology",
    "Marketing",
    "Legal",
    "Team Building",
    "Operations",
    "Product Development",
  ];

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

  const getStatusIcon = (status: string) => {
    return status === "answered" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-orange-600" />
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
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Query Panel
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
            Ask Expert Advisors
          </h1>
          <p className="text-gray-600">
            Get professional advice from experienced business advisors and
            industry experts.
          </p>
        </div>

        <Tabs defaultValue="my-queries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-queries">My Queries</TabsTrigger>
            <TabsTrigger value="ask-question">Ask New Question</TabsTrigger>
          </TabsList>

          <TabsContent value="my-queries" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockUserQueries.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      mockUserQueries.filter((q) => q.status === "answered")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Answered</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mockUserQueries.filter((q) => q.status === "open").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockUserQueries.reduce((sum, q) => sum + q.responses, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Responses</div>
                </CardContent>
              </Card>
            </div>

            {/* Queries List */}
            <div className="space-y-4">
              {mockUserQueries.map((query) => (
                <Card
                  key={query.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    setSelectedQueryId(
                      selectedQueryId === query.id ? null : query.id,
                    )
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(query.status)}
                          <CardTitle className="text-lg">
                            {query.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {query.description}
                        </CardDescription>
                      </div>
                      <Badge className={getPriorityColor(query.priority)}>
                        {query.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {query.askedOn}
                        </span>
                        <Badge variant="outline">{query.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {query.responses}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {query.upvotes}
                        </span>
                        <span>{query.views} views</span>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {selectedQueryId === query.id &&
                      query.status === "answered" && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <h4 className="font-semibold">Expert Responses:</h4>
                          {mockResponses.map((response) => (
                            <div
                              key={response.id}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-medium">
                                    {response.advisor}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    {response.title}
                                  </p>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {response.timestamp}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">
                                {response.response}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {response.upvotes}
                                </Button>
                                <Badge
                                  variant={
                                    response.helpful ? "default" : "secondary"
                                  }
                                >
                                  {response.helpful
                                    ? "Helpful"
                                    : "Mark as Helpful"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ask-question">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Ask a New Question
                </CardTitle>
                <CardDescription>
                  Get expert advice from experienced business advisors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitQuery} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Question Title *</Label>
                    <Input
                      id="title"
                      placeholder="Summarize your question in one clear sentence"
                      value={newQuery.title}
                      onChange={(e) =>
                        setNewQuery({ ...newQuery, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newQuery.category}
                      onValueChange={(value) =>
                        setNewQuery({ ...newQuery, category: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the most relevant category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select
                      value={newQuery.priority}
                      onValueChange={(value) =>
                        setNewQuery({ ...newQuery, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">
                          Low - General inquiry
                        </SelectItem>
                        <SelectItem value="Medium">
                          Medium - Important question
                        </SelectItem>
                        <SelectItem value="High">
                          High - Urgent business need
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide context, background information, and specific details about your situation. The more information you provide, the better advice you'll receive."
                      value={newQuery.description}
                      onChange={(e) =>
                        setNewQuery({
                          ...newQuery,
                          description: e.target.value,
                        })
                      }
                      rows={6}
                      required
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Tips for Getting Better Answers:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • Be specific about your industry and business model
                      </li>
                      <li>
                        • Include relevant numbers (revenue, team size, etc.)
                      </li>
                      <li>• Mention what you've already tried</li>
                      <li>• Ask one focused question per post</li>
                    </ul>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Question
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
