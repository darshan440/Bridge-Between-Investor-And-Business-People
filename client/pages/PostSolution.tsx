import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

// Mock data for business queries
const mockQueries = [
  {
    id: 1,
    title: "How to validate my SaaS product idea before building?",
    description:
      "I have an idea for a project management SaaS tool for small teams. How can I validate this idea without spending too much money on development?",
    category: "Product Development",
    priority: "High",
    askedBy: "Rajesh Kumar",
    askedOn: "2 hours ago",
    responses: 3,
    status: "open",
  },
  {
    id: 2,
    title: "Best funding options for a food tech startup?",
    description:
      "We're a food delivery startup focusing on healthy meals. What are the best funding options for early-stage food tech companies in India?",
    category: "Funding",
    priority: "Medium",
    askedBy: "Priya Sharma",
    askedOn: "5 hours ago",
    responses: 1,
    status: "open",
  },
  {
    id: 3,
    title: "How to build a strong founding team?",
    description:
      "I'm a solo founder working on an AI startup. How do I find and attract the right co-founders and early employees?",
    category: "Team Building",
    priority: "High",
    askedBy: "Amit Patel",
    askedOn: "1 day ago",
    responses: 5,
    status: "answered",
  },
  {
    id: 4,
    title: "Legal requirements for starting a tech company in India?",
    description:
      "What are the essential legal steps and compliance requirements for registering a technology company in India?",
    category: "Legal",
    priority: "Medium",
    askedBy: "Neha Gupta",
    askedOn: "2 days ago",
    responses: 2,
    status: "open",
  },
];

export default function PostSolution() {
  const [selectedQuery, setSelectedQuery] = useState("");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuery || !solution.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a query and provide a solution.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const postSolution = httpsCallable(functions, "postSolution");
      const result = await postSolution({
        queryId: selectedQuery,
        solution: solution.trim(),
      });

      const data = result.data as {
        success: boolean;
        message: string;
        solutionId: string;
      };

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
          className: "bg-green-50 border-green-200",
        });

        // Reset form
        setSolution("");
        setSelectedQuery("");

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error posting solution:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to post solution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                Provide Solutions
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
            Help Entrepreneurs Succeed
          </h1>
          <p className="text-gray-600">
            Share your expertise by providing solutions to business challenges
            faced by entrepreneurs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Solution Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Provide Your Expert Solution</CardTitle>
                <CardDescription>
                  Select a query and share your professional advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="query">Select Query to Answer *</Label>
                    <Select
                      value={selectedQuery}
                      onValueChange={setSelectedQuery}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a business query to answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockQueries
                          .filter((query) => query.status === "open")
                          .map((query) => (
                            <SelectItem
                              key={query.id}
                              value={query.id.toString()}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {query.title}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {query.category} • {query.askedBy} •{" "}
                                  {query.askedOn}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedQuery && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {(() => {
                        const query = mockQueries.find(
                          (q) => q.id.toString() === selectedQuery,
                        );
                        return query ? (
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">
                              {query.title}
                            </h4>
                            <p className="text-blue-800 text-sm mb-3">
                              {query.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge
                                className={getPriorityColor(query.priority)}
                              >
                                {query.priority} Priority
                              </Badge>
                              <span className="text-blue-700">
                                Asked by {query.askedBy}
                              </span>
                              <span className="text-blue-600">•</span>
                              <span className="text-blue-700">
                                {query.askedOn}
                              </span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="solution">Your Expert Solution *</Label>
                    <Textarea
                      id="solution"
                      placeholder="Provide detailed, actionable advice based on your expertise. Include specific steps, resources, or recommendations."
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      rows={8}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Minimum 100 characters required for a comprehensive answer
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={
                        !selectedQuery || solution.length < 100 || loading
                      }
                    >
                      {loading ? "Submitting..." : "Submit Solution"}
                    </Button>
                    <Button type="button" variant="outline" disabled={loading}>
                      Save Draft
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Queries */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Queries
                </CardTitle>
                <CardDescription>
                  Latest questions from entrepreneurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockQueries.slice(0, 3).map((query) => (
                  <div
                    key={query.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium line-clamp-2">
                        {query.title}
                      </h4>
                      {getStatusIcon(query.status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{query.askedBy}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{query.askedOn}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {query.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {query.responses} responses
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-sm text-gray-600">
                    Solutions Provided
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4.8</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">156</div>
                  <div className="text-sm text-gray-600">
                    Entrepreneurs Helped
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Solution Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Provide actionable, specific advice</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Include relevant examples or case studies</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Be respectful and professional</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Avoid promotional content</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
