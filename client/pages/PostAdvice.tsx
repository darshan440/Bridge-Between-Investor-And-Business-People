import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Lightbulb,
  MessageSquare,
  Users,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Info,
  Star,
} from "lucide-react";

// Dummy data for existing advice posts
const dummyAdvicePosts = [
  {
    id: "1",
    title: "Essential Financial Planning for Startups",
    category: "Finance",
    excerpt:
      "Learn the fundamentals of financial planning that every startup needs to succeed...",
    author: "Sarah Johnson",
    date: "2024-01-15",
    likes: 45,
    comments: 12,
    tags: ["Finance", "Startups", "Planning"],
    readTime: "5 min read",
  },
  {
    id: "2",
    title: "Building a Strong Team Culture in Remote Work",
    category: "Management",
    excerpt:
      "Discover strategies to maintain team cohesion and productivity in remote settings...",
    author: "Michael Chen",
    date: "2024-01-12",
    likes: 32,
    comments: 8,
    tags: ["Management", "Remote Work", "Culture"],
    readTime: "7 min read",
  },
  {
    id: "3",
    title: "Marketing on a Bootstrap Budget",
    category: "Marketing",
    excerpt:
      "Effective marketing strategies that don't break the bank for new businesses...",
    author: "Emily Rodriguez",
    date: "2024-01-10",
    likes: 67,
    comments: 23,
    tags: ["Marketing", "Budget", "Growth"],
    readTime: "6 min read",
  },
];

const PostAdvice: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    tags: "",
    targetAudience: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    "Finance & Funding",
    "Marketing & Sales",
    "Operations Management",
    "Human Resources",
    "Technology",
    "Legal & Compliance",
    "Strategy & Planning",
    "Leadership",
    "Product Development",
    "Customer Relations",
  ];

  const targetAudiences = [
    "Startups",
    "Small Businesses",
    "Medium Enterprises",
    "E-commerce",
    "Tech Companies",
    "Service Businesses",
    "Retail",
    "Manufacturing",
    "All Businesses",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Advice post data:", formData);
      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          category: "",
          content: "",
          tags: "",
          targetAudience: "",
        });
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error posting advice:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.category &&
      formData.content.trim() &&
      formData.targetAudience
    );
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
              <h1 className="text-3xl font-bold text-gray-900">Post Advice</h1>
              <p className="text-gray-600">
                Share your business expertise with entrepreneurs
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Share Your Business Advice
                </CardTitle>
                <CardDescription>
                  Help fellow entrepreneurs with your knowledge and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      🎉 Your advice has been posted successfully! It will help
                      many entrepreneurs.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Article Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Essential Tips for First-Time Entrepreneurs"
                      required
                    />
                  </div>

                  {/* Category and Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
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

                    <div>
                      <Label htmlFor="audience">Target Audience *</Label>
                      <Select
                        value={formData.targetAudience}
                        onValueChange={(value) =>
                          handleInputChange("targetAudience", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Who is this for?" />
                        </SelectTrigger>
                        <SelectContent>
                          {targetAudiences.map((audience) => (
                            <SelectItem key={audience} value={audience}>
                              {audience}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Article Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      placeholder="Share your detailed advice, tips, and insights here. Include practical examples and actionable steps..."
                      rows={12}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 200 characters. Use clear headings and bullet
                      points for better readability.
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label htmlFor="tags">Tags (optional)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        handleInputChange("tags", e.target.value)
                      }
                      placeholder="e.g., startup, funding, marketing (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add relevant tags to help others find your advice
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={!isFormValid() || loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Publish Advice
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Writing Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    ✅ <strong>Be specific</strong> - Use real examples and case
                    studies
                  </p>
                  <p>
                    ✅ <strong>Stay practical</strong> - Focus on actionable
                    advice
                  </p>
                  <p>
                    ✅ <strong>Structure well</strong> - Use headings and bullet
                    points
                  </p>
                  <p>
                    ✅ <strong>Be encouraging</strong> - Support fellow
                    entrepreneurs
                  </p>
                  <p>❌ Avoid generic advice without context</p>
                  <p>❌ Don't promote specific products/services</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Advice Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Recent Popular Advice
                </CardTitle>
                <CardDescription>See what topics are trending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummyAdvicePosts.map((post) => (
                    <div
                      key={post.id}
                      className="border-b pb-3 last:border-b-0"
                    >
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{post.readTime}</span>
                        <div className="flex items-center space-x-2">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Advisors
                    </span>
                    <span className="font-semibold">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Articles Published
                    </span>
                    <span className="font-semibold">1,423</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Entrepreneurs Helped
                    </span>
                    <span className="font-semibold">8,920</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Average Rating
                    </span>
                    <span className="font-semibold">4.8 ⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAdvice;
