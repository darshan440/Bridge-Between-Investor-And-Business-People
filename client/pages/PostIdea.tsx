import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { ArrowLeft, DollarSign, Lightbulb, Tag } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function PostIdea() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    budget: "",
    timeline: "",
    targetMarket: "",
    revenue: "",
    team: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.category ||
      !formData.description ||
      !formData.budget ||
      !formData.timeline
    ) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields (marked with *).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const postBusinessIdea = httpsCallable(functions, "postBusinessIdea");

      const result = await postBusinessIdea({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        budget: formData.budget,
        timeline: formData.timeline,
        targetMarket: formData.targetMarket,
        revenue: formData.revenue,
        team: formData.team,
      });

      const data = result.data as {
        success: boolean;
        message: string;
        businessIdeaId: string;
      };

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
          className: "bg-green-50 border-green-200",
        });

        // Reset form
        setFormData({
          title: "",
          category: "",
          description: "",
          budget: "",
          timeline: "",
          targetMarket: "",
          revenue: "",
          team: "",
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      if (error.message?.trim() === "failed-precondition") {
        toast({
          title: "Incomplete Profile",
          description:
            "To post a business idea, your profile must include your company name. Please update your profile before proceeding.",
          variant: "destructive",
          action: (
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Go to My Profile
            </Button>
          ),
        });
      } else {
        toast({
          title: "Error",
          description:
            error.message?.trim() ||
            "Failed to post business idea. Please try again.",
          variant: "destructive",
        });
      }
      console.error("Error posting business idea:", error.message || error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const categories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Food & Beverage",
    "Real Estate",
    "Agriculture",
    "Manufacturing",
    "Services",
    "Others",
  ];

  const timelines = [
    "3-6 months",
    "6-12 months",
    "1-2 years",
    "2-3 years",
    "3+ years",
  ];

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
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Post Your Business Idea
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Innovation
          </h1>
          <p className="text-gray-600">
            Present your business idea to potential investors and get the
            funding you need to bring your vision to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Idea Details</CardTitle>
                <CardDescription>
                  Provide comprehensive information about your business concept
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Idea Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a compelling title for your business idea"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Business Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your business category" />
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
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business idea in detail. What problem does it solve? What makes it unique?"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Required Investment *</Label>
                      <Input
                        id="budget"
                        placeholder="e.g., ₹10,00,000"
                        value={formData.budget}
                        onChange={(e) =>
                          handleInputChange("budget", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline">Expected Timeline *</Label>
                      <Select
                        value={formData.timeline}
                        onValueChange={(value) =>
                          handleInputChange("timeline", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          {timelines.map((timeline) => (
                            <SelectItem key={timeline} value={timeline}>
                              {timeline}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetMarket">Target Market</Label>
                    <Input
                      id="targetMarket"
                      placeholder="Describe your target customers and market size"
                      value={formData.targetMarket}
                      onChange={(e) =>
                        handleInputChange("targetMarket", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revenue">Revenue Model</Label>
                    <Textarea
                      id="revenue"
                      placeholder="Explain how your business will generate revenue"
                      value={formData.revenue}
                      onChange={(e) =>
                        handleInputChange("revenue", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">Team Information</Label>
                    <Textarea
                      id="team"
                      placeholder="Describe your team's background and expertise"
                      value={formData.team}
                      onChange={(e) =>
                        handleInputChange("team", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Business Idea"}
                    </Button>
                    <Button type="button" variant="outline" disabled={loading}>
                      Save Draft
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-blue-600" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Be Specific
                  </h4>
                  <p className="text-sm text-blue-800">
                    Provide detailed information about your market research and
                    competitive analysis.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Show Traction
                  </h4>
                  <p className="text-sm text-green-800">
                    Include any existing customers, partnerships, or prototype
                    development.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Financial Clarity
                  </h4>
                  <p className="text-sm text-purple-800">
                    Be realistic about your funding needs and timeline for
                    returns.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  What Investors Look For
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Large addressable market</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Strong founding team</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Clear competitive advantage</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Scalable business model</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Path to profitability</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
