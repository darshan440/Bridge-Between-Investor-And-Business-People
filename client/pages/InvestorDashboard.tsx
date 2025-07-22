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
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Star,
  Filter,
  Search,
  DollarSign,
  Calendar,
  User,
  Building,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { getDummyDashboardData } from "@/lib/dummyData";

interface BusinessIdea {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  views: number;
  interested: number;
  likes: string[];
  status: string;
  featured: boolean;
  authorName: string;
  authorEmail: string;
  createdAt: any;
  updatedAt: any;
}

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

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
  ];

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener for business ideas
    const businessIdeasRef = collection(db, "businessIdeas");
    const businessIdeasQuery = query(
      businessIdeasRef,
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    const unsubscribe = onSnapshot(businessIdeasQuery, (snapshot) => {
      const ideas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BusinessIdea[];

      if (ideas.length === 0) {
        // Use dummy data if no real data
        const dummyData = getDummyDashboardData("investor");
        setBusinessIdeas(dummyData.businessIdeas || []);
      } else {
        setBusinessIdeas(ideas);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    filterIdeas();
  }, [businessIdeas, searchTerm, selectedCategory, selectedFilter, ratingFilter]);

  const filterIdeas = () => {
    let filtered = [...businessIdeas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((idea) => idea.category === selectedCategory);
    }

    // Special filters
    switch (selectedFilter) {
      case "featured":
        filtered = filtered.filter((idea) => idea.featured);
        break;
      case "most_liked":
        filtered = filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        break;
      case "most_viewed":
        filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "recent":
        filtered = filtered.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bTime.getTime() - aTime.getTime();
        });
        break;
    }

    // Rating filter (based on interested count)
    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter((idea) => {
        const rating = Math.min(5, Math.floor((idea.interested || 0) / 2) + 1);
        return rating >= minRating;
      });
    }

    setFilteredIdeas(filtered);
  };

  const handleLike = async (ideaId: string, currentLikes: string[] = []) => {
    if (!user?.uid) return;

    try {
      const ideaRef = doc(db, "businessIdeas", ideaId);
      const isLiked = currentLikes.includes(user.uid);

      if (isLiked) {
        await updateDoc(ideaRef, {
          likes: arrayRemove(user.uid),
        });
      } else {
        await updateDoc(ideaRef, {
          likes: arrayUnion(user.uid),
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleInterested = async (ideaId: string) => {
    if (!user?.uid) return;

    try {
      const ideaRef = doc(db, "businessIdeas", ideaId);
      await updateDoc(ideaRef, {
        interested: (businessIdeas.find(idea => idea.id === ideaId)?.interested || 0) + 1,
      });
    } catch (error) {
      console.error("Error marking interested:", error);
    }
  };

  const getRating = (interested: number) => {
    return Math.min(5, Math.floor(interested / 2) + 1);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  const formatBudget = (budget: string) => {
    return budget.replace(/₹/g, "₹");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading investment opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Investment Opportunities
            </h1>
            <p className="text-gray-600">
              Discover promising business ideas to invest in
            </p>
          </div>
          <div className="flex space-x-4">
            <Link to="/my-investments">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                My Investments
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button>
                <TrendingUp className="h-4 w-4 mr-2" />
                Portfolio
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

              {/* Special Filters */}
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ideas</SelectItem>
                  <SelectItem value="featured">⭐ Featured</SelectItem>
                  <SelectItem value="most_liked">❤️ Most Liked</SelectItem>
                  <SelectItem value="most_viewed">👁️ Most Viewed</SelectItem>
                  <SelectItem value="recent">🕒 Recent</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4+ Stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3+ Stars</SelectItem>
                  <SelectItem value="2">⭐⭐ 2+ Stars</SelectItem>
                  <SelectItem value="1">⭐ 1+ Stars</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedFilter("all");
                  setRatingFilter("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredIdeas.length} opportunities found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Business Ideas Grid */}
        {filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {idea.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{idea.category}</Badge>
                        {idea.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < getRating(idea.interested || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="font-semibold text-sm">{formatBudget(idea.budget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Timeline</p>
                      <p className="font-semibold text-sm">{idea.timeline}</p>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{idea.views || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{idea.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{idea.interested || 0}</span>
                      </div>
                    </div>
                    <span>{formatDate(idea.createdAt)}</span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{idea.authorName}</p>
                      <p className="text-xs text-gray-500">Business Person</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/idea/${idea.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => handleInterested(idea.id)}
                      className="w-full"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Invest
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLike(idea.id, idea.likes)}
                      className={`w-full ${
                        idea.likes?.includes(user?.uid || "")
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {idea.likes?.includes(user?.uid || "") ? "Liked" : "Like"}
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Investment Opportunities Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== "all" || selectedFilter !== "all"
                  ? "Try adjusting your filters to see more opportunities."
                  : "No business ideas are available for investment at the moment. Check back later for new opportunities."}
              </p>
              {(searchTerm || selectedCategory !== "all" || selectedFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedFilter("all");
                    setRatingFilter("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;
