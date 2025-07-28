import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Save,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface BusinessIdea {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  targetMarket?: string;
  revenueModel?: string;
  teamInfo?: string;
  status: string;
  views: number;
  interested: number;
  featured: boolean;
  tags: string[];
  userId: string;
  authorName: string;
  authorEmail: string;
  authorProfile?: any;
  changeCount?: number;
  lastChanged?: any;
  createdAt: any;
  updatedAt: any;
}

const ViewIdeaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();

  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<BusinessIdea>>({});

  const categories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Food & Beverage",
    "Travel & Tourism",
    "Real Estate",
    "Manufacturing",
    "Agriculture",
    "Entertainment",
    "Environment",
    "Other",
  ];

  const timelines = [
    "1-3 months",
    "3-6 months",
    "6-12 months",
    "1-2 years",
    "2+ years",
  ];

  useEffect(() => {
    if (id) {
      loadIdeaDetails();
    }
  }, [id]);

  const loadIdeaDetails = async () => {
    try {
      const ideaDoc = await getDoc(doc(db, "businessIdeas", id!));
      if (ideaDoc.exists()) {
        const ideaData = { id: ideaDoc.id, ...ideaDoc.data() } as BusinessIdea;
        setIdea(ideaData);
        setFormData(ideaData);

        // Increment view count if not the owner
        if (currentUser?.uid !== ideaData.userId) {
          await updateDoc(doc(db, "businessIdeas", id!), {
            views: (ideaData.views || 0) + 1,
          });
        }
      } else {
        toast({
          title: "Not Found",
          description: "Business idea not found.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error loading idea:", error); //got error here
      toast({
        title: "Error",
        description: "Failed to load business idea details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!idea || !currentUser) return;

    setSaving(true);
    try {
      const updateData = {
        ...formData,
        changeCount: (idea.changeCount || 0) + 1,
        lastChanged: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "businessIdeas", idea.id), updateData);

      setIdea((prev) => ({ ...prev!, ...updateData }));
      setEditing(false);

      toast({
        title: "Success",
        description: "Business idea updated successfully!",
      });
    } catch (error) {
      console.error("Error updating idea:", error);
      toast({
        title: "Error",
        description: "Failed to update business idea.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInterested = async () => {
    if (!idea || !currentUser) return;

    try {
      await updateDoc(doc(db, "businessIdeas", idea.id), {
        interested: (idea.interested || 0) + 1,
      });

      setIdea((prev) => ({
        ...prev!,
        interested: (prev!.interested || 0) + 1,
      }));

      toast({
        title: "Success",
        description: "Marked as interested!",
      });
    } catch (error) {
      console.error("Error marking interested:", error); // got error here 
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business idea...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Idea Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The business idea you're looking for doesn't exist.
          </p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    idea ? id === currentUser?.uid &&
      userProfile?.role === "business_person" : false;

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
              <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
              <p className="text-gray-600">Business Idea Details</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData(idea);
                    }}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Idea
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Change Tracking */}
        {idea.changeCount && idea.changeCount > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ This idea has been modified {idea.changeCount} time
              {idea.changeCount > 1 ? "s" : ""} | Last changed:{" "}
              {formatDate(idea.lastChanged)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core details about the business idea
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title || ""}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter business idea title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category || ""}
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
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={6}
                        placeholder="Describe your business idea in detail..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Title
                      </h3>
                      <p className="text-gray-700">{idea.title}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Category
                      </h3>
                      <Badge variant="secondary">{idea.category}</Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {idea.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Financial & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Financial & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="budget">Budget *</Label>
                      <Input
                        id="budget"
                        value={formData.budget || ""}
                        onChange={(e) =>
                          handleInputChange("budget", e.target.value)
                        }
                        placeholder="e.g., ₹10-20 Lakhs"
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeline">Timeline *</Label>
                      <Select
                        value={formData.timeline || ""}
                        onValueChange={(value) =>
                          handleInputChange("timeline", value)
                        }
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
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Budget
                      </h3>
                      <p className="text-gray-700">{idea.budget}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Timeline
                      </h3>
                      <p className="text-gray-700">{idea.timeline}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <>
                    <div>
                      <Label htmlFor="targetMarket">Target Market</Label>
                      <Input
                        id="targetMarket"
                        value={formData.targetMarket || ""}
                        onChange={(e) =>
                          handleInputChange("targetMarket", e.target.value)
                        }
                        placeholder="Who is your target audience?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="revenueModel">Revenue Model</Label>
                      <Textarea
                        id="revenueModel"
                        value={formData.revenueModel || ""}
                        onChange={(e) =>
                          handleInputChange("revenueModel", e.target.value)
                        }
                        rows={3}
                        placeholder="How will this business make money?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="teamInfo">Team Information</Label>
                      <Textarea
                        id="teamInfo"
                        value={formData.teamInfo || ""}
                        onChange={(e) =>
                          handleInputChange("teamInfo", e.target.value)
                        }
                        rows={3}
                        placeholder="Tell us about your team"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {idea.targetMarket && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Target Market
                        </h3>
                        <p className="text-gray-700">{idea.targetMarket}</p>
                      </div>
                    )}

                    {idea.revenueModel && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Revenue Model
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {idea.revenueModel}
                        </p>
                      </div>
                    )}

                    {idea.teamInfo && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Team Information
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {idea.teamInfo}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Engagement Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Views</span>
                    </div>
                    <span className="font-semibold">{idea.views || 0}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Interested</span>
                    </div>
                    <span className="font-semibold">
                      {idea.interested || 0}
                    </span>
                  </div>

                  {!isOwner && (
                    <Button
                      onClick={handleInterested}
                      className="w-full"
                      variant="outline"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Show Interest
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Author Information */}
            <Card>
              <CardHeader>
                <CardTitle>Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{idea.authorName}</p>
                      <p className="text-sm text-gray-500">
                        {idea.authorEmail}
                      </p>
                    </div>
                  </div>

                  {idea.authorProfile?.companyName && (
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {idea.authorProfile.companyName}
                      </span>
                    </div>
                  )}

                  {!isOwner && (
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Author
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    className={
                      idea.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {idea.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(idea.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(idea.updatedAt)}
                  </p>
                </div>

                {idea.tags && idea.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {idea.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIdeaDetails;
