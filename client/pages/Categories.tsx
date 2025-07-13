import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  ArrowLeft,
  Cpu,
  Heart,
  Leaf,
  Wheat,
  Banknote,
  GraduationCap,
  Factory,
  Truck,
  Smartphone,
  ShoppingBag,
  Home,
  Camera,
} from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Technology",
    description: "AI, Software, Apps, and Digital Innovation",
    icon: Cpu,
    count: 89,
    trending: true,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    subcategories: [
      "Artificial Intelligence",
      "Mobile Apps",
      "SaaS",
      "Blockchain",
      "IoT",
    ],
  },
  {
    id: 2,
    name: "Healthcare",
    description: "Medical Technology, Digital Health, and Wellness",
    icon: Heart,
    count: 45,
    trending: true,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-900",
    subcategories: [
      "Telemedicine",
      "Medical Devices",
      "Health Apps",
      "Biotechnology",
      "Wellness",
    ],
  },
  {
    id: 3,
    name: "Sustainability",
    description: "Green Technology, Renewable Energy, and Eco Solutions",
    icon: Leaf,
    count: 34,
    trending: true,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-900",
    subcategories: [
      "Renewable Energy",
      "Waste Management",
      "Green Products",
      "Carbon Solutions",
      "Water Tech",
    ],
  },
  {
    id: 4,
    name: "Agriculture",
    description: "Smart Farming, AgriTech, and Food Innovation",
    icon: Wheat,
    count: 28,
    trending: false,
    color: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-900",
    subcategories: [
      "Smart Farming",
      "Food Processing",
      "Supply Chain",
      "Organic Products",
      "Livestock",
    ],
  },
  {
    id: 5,
    name: "Finance",
    description: "FinTech, Digital Banking, and Investment Solutions",
    icon: Banknote,
    count: 22,
    trending: false,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-900",
    subcategories: [
      "Digital Banking",
      "Investment Apps",
      "Insurance Tech",
      "Cryptocurrency",
      "Lending",
    ],
  },
  {
    id: 6,
    name: "Education",
    description: "EdTech, Online Learning, and Educational Innovation",
    icon: GraduationCap,
    count: 16,
    trending: false,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-900",
    subcategories: [
      "E-Learning",
      "Skill Development",
      "Educational Games",
      "Language Learning",
      "Certification",
    ],
  },
  {
    id: 7,
    name: "Manufacturing",
    description: "Industry 4.0, Automation, and Production Innovation",
    icon: Factory,
    count: 19,
    trending: false,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-900",
    subcategories: [
      "Automation",
      "3D Printing",
      "Quality Control",
      "Supply Chain",
      "Robotics",
    ],
  },
  {
    id: 8,
    name: "Logistics",
    description: "Transportation, Delivery, and Supply Chain Solutions",
    icon: Truck,
    count: 13,
    trending: false,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-900",
    subcategories: [
      "Last Mile Delivery",
      "Fleet Management",
      "Warehousing",
      "Tracking Systems",
      "Drone Delivery",
    ],
  },
  {
    id: 9,
    name: "Consumer Tech",
    description: "Gadgets, Electronics, and Consumer Products",
    icon: Smartphone,
    count: 25,
    trending: true,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-900",
    subcategories: [
      "Smart Devices",
      "Wearables",
      "Gaming",
      "Entertainment",
      "Home Automation",
    ],
  },
  {
    id: 10,
    name: "E-commerce",
    description: "Online Retail, Marketplaces, and Digital Commerce",
    icon: ShoppingBag,
    count: 31,
    trending: true,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-900",
    subcategories: [
      "Online Marketplaces",
      "B2B Commerce",
      "Social Commerce",
      "Subscription Services",
      "Digital Payments",
    ],
  },
  {
    id: 11,
    name: "Real Estate",
    description: "PropTech, Smart Buildings, and Property Innovation",
    icon: Home,
    count: 18,
    trending: false,
    color: "from-stone-500 to-neutral-600",
    bgColor: "bg-stone-50",
    borderColor: "border-stone-200",
    textColor: "text-stone-900",
    subcategories: [
      "PropTech",
      "Smart Buildings",
      "Real Estate Platforms",
      "Property Management",
      "Construction Tech",
    ],
  },
  {
    id: 12,
    name: "Media & Content",
    description: "Digital Media, Content Creation, and Entertainment",
    icon: Camera,
    count: 14,
    trending: false,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-900",
    subcategories: [
      "Content Platforms",
      "Video Streaming",
      "Social Media",
      "Digital Marketing",
      "Creator Economy",
    ],
  },
];

export default function Categories() {
  const trendingCategories = categories.filter((cat) => cat.trending);
  const allCategories = categories.sort((a, b) => b.count - a.count);

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
                  Business Categories
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Business Categories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover investment opportunities and business ideas across various
            industries and sectors.
          </p>
        </div>

        {/* Trending Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔥 Trending Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${category.bgColor} ${category.borderColor} border-2`}
                >
                  <CardHeader className="text-center">
                    <div
                      className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-3`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className={`text-lg ${category.textColor}`}>
                      {category.name}
                    </CardTitle>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {category.count}
                      </span>
                      <span className="text-sm text-gray-600">
                        opportunities
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* All Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {category.name}
                          {category.trending && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Trending
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {category.count} opportunities
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-3">
                      {category.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 3).map((sub, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{category.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Statistics */}
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Active Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">354</div>
                <div className="text-sm text-gray-600">Total Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">Trending Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">89</div>
                <div className="text-sm text-gray-600">New This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
