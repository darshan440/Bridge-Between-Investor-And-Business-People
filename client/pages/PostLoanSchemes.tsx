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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  FileText,
  Clock,
  Shield,
  TrendingUp,
  Building,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

// Mock data for existing loan schemes
const mockLoanSchemes = [
  {
    id: 1,
    name: "MSME Growth Loan",
    bank: "State Bank of India",
    minAmount: "₹5,00,000",
    maxAmount: "₹50,00,000",
    interestRate: "8.5% - 12%",
    tenure: "1-7 years",
    category: "MSME",
    applications: 45,
    approved: 32,
  },
  {
    id: 2,
    name: "Startup Funding Scheme",
    bank: "HDFC Bank",
    minAmount: "₹10,00,000",
    maxAmount: "₹2,00,00,000",
    interestRate: "9% - 14%",
    tenure: "3-10 years",
    category: "Startup",
    applications: 23,
    approved: 15,
  },
  {
    id: 3,
    name: "Women Entrepreneur Loan",
    bank: "ICICI Bank",
    minAmount: "₹2,00,000",
    maxAmount: "₹25,00,000",
    interestRate: "7.5% - 11%",
    tenure: "2-5 years",
    category: "Women Entrepreneurship",
    applications: 67,
    approved: 45,
  },
];

export default function PostLoanSchemes() {
  const [formData, setFormData] = useState({
    schemeName: "",
    bankName: "",
    schemeType: "",
    minAmount: "",
    maxAmount: "",
    interestRateMin: "",
    interestRateMax: "",
    tenureMin: "",
    tenureMax: "",
    description: "",
    eligibility: "",
    documents: "",
    features: [] as string[],
    collateralRequired: false,
    processingFee: "",
    processingTime: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.schemeName ||
      !formData.schemeType ||
      !formData.minAmount ||
      !formData.maxAmount ||
      !formData.interestRateMin ||
      !formData.description
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
      const postLoanScheme = httpsCallable(functions, "postLoanScheme");
      const result = await postLoanScheme({
        schemeName: formData.schemeName,
        loanType: formData.schemeType,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        interestRate: `${formData.interestRateMin}${formData.interestRateMax ? `-${formData.interestRateMax}` : ""}%`,
        tenure: `${formData.tenureMin}${formData.tenureMax ? `-${formData.tenureMax}` : ""} years`,
        description: formData.description,
        eligibility: formData.eligibility,
        features: formData.features,
        collateralRequired: formData.collateralRequired,
        processingFee: formData.processingFee,
        processingTime: formData.processingTime,
      });

      const data = result.data as {
        success: boolean;
        message: string;
        loanSchemeId: string;
      };

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
          className: "bg-green-50 border-green-200",
        });

        // Reset form
        setFormData({
          schemeName: "",
          schemeType: "",
          minAmount: "",
          maxAmount: "",
          interestRateMin: "",
          interestRateMax: "",
          tenureMin: "",
          tenureMax: "",
          description: "",
          eligibility: "",
          documents: "",
          features: [],
          collateralRequired: false,
          processingFee: "",
          processingTime: "",
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error posting loan scheme:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to post loan scheme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter((f) => f !== feature),
    }));
  };

  const schemeTypes = [
    "MSME Loan",
    "Startup Funding",
    "Working Capital",
    "Term Loan",
    "Equipment Financing",
    "Women Entrepreneurship",
    "Export Finance",
    "Agriculture Business",
    "Technology Loan",
    "Green Energy Loan",
  ];

  const loanFeatures = [
    "No Processing Fee",
    "Quick Approval",
    "Flexible Repayment",
    "Part Prepayment Allowed",
    "No Hidden Charges",
    "Digital Documentation",
    "Doorstep Service",
    "24/7 Support",
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
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Post Loan Schemes
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
            Create New Loan Scheme
          </h1>
          <p className="text-gray-600">
            Design and publish loan schemes to help entrepreneurs and businesses
            access funding.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Scheme Details</CardTitle>
                <CardDescription>
                  Provide comprehensive information about your loan offering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schemeName">Scheme Name *</Label>
                      <Input
                        id="schemeName"
                        placeholder="e.g., MSME Growth Loan"
                        value={formData.schemeName}
                        onChange={(e) =>
                          handleInputChange("schemeName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank/Institution Name *</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., State Bank of India"
                        value={formData.bankName}
                        onChange={(e) =>
                          handleInputChange("bankName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schemeType">Loan Type *</Label>
                    <Select
                      value={formData.schemeType}
                      onValueChange={(value) =>
                        handleInputChange("schemeType", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minAmount">Minimum Amount *</Label>
                      <Input
                        id="minAmount"
                        placeholder="e.g., ₹5,00,000"
                        value={formData.minAmount}
                        onChange={(e) =>
                          handleInputChange("minAmount", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAmount">Maximum Amount *</Label>
                      <Input
                        id="maxAmount"
                        placeholder="e.g., ₹50,00,000"
                        value={formData.maxAmount}
                        onChange={(e) =>
                          handleInputChange("maxAmount", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interestRateMin">
                        Interest Rate Range *
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="interestRateMin"
                          placeholder="8.5"
                          value={formData.interestRateMin}
                          onChange={(e) =>
                            handleInputChange("interestRateMin", e.target.value)
                          }
                          required
                        />
                        <span>% to</span>
                        <Input
                          placeholder="12"
                          value={formData.interestRateMax}
                          onChange={(e) =>
                            handleInputChange("interestRateMax", e.target.value)
                          }
                          required
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tenure">Tenure Range *</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="tenureMin"
                          placeholder="1"
                          value={formData.tenureMin}
                          onChange={(e) =>
                            handleInputChange("tenureMin", e.target.value)
                          }
                          required
                        />
                        <span>to</span>
                        <Input
                          placeholder="7"
                          value={formData.tenureMax}
                          onChange={(e) =>
                            handleInputChange("tenureMax", e.target.value)
                          }
                          required
                        />
                        <span>years</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Scheme Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the loan scheme, its purpose, and key benefits"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility Criteria *</Label>
                    <Textarea
                      id="eligibility"
                      placeholder="Define who can apply for this loan (age, business type, turnover, etc.)"
                      value={formData.eligibility}
                      onChange={(e) =>
                        handleInputChange("eligibility", e.target.value)
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Required Documents</Label>
                    <Textarea
                      id="documents"
                      placeholder="List all required documents for loan application"
                      value={formData.documents}
                      onChange={(e) =>
                        handleInputChange("documents", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="processingFee">Processing Fee</Label>
                      <Input
                        id="processingFee"
                        placeholder="e.g., 1% of loan amount"
                        value={formData.processingFee}
                        onChange={(e) =>
                          handleInputChange("processingFee", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="processingTime">Processing Time</Label>
                      <Input
                        id="processingTime"
                        placeholder="e.g., 7-15 business days"
                        value={formData.processingTime}
                        onChange={(e) =>
                          handleInputChange("processingTime", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Loan Features</Label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {loanFeatures.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={feature}
                            checked={formData.features.includes(feature)}
                            onCheckedChange={(checked) =>
                              handleFeatureChange(feature, checked as boolean)
                            }
                          />
                          <Label htmlFor={feature} className="text-sm">
                            {feature}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="collateral"
                      checked={formData.collateralRequired}
                      onCheckedChange={(checked) =>
                        handleInputChange(
                          "collateralRequired",
                          checked as boolean,
                        )
                      }
                    />
                    <Label htmlFor="collateral">Collateral Required</Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Publishing..." : "Publish Loan Scheme"}
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
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Active Schemes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockLoanSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-semibold text-sm mb-1">
                      {scheme.name}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">{scheme.bank}</p>
                    <div className="flex justify-between text-xs">
                      <span>
                        {scheme.minAmount} - {scheme.maxAmount}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {scheme.category}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{scheme.applications} applications</span>
                      <span>{scheme.approved} approved</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Ensure competitive interest rates</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Clear eligibility criteria</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Transparent terms and conditions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <span>Quick processing commitment</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">8.5%</div>
                  <div className="text-sm text-gray-600">
                    Average Interest Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    15 days
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg Processing Time
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">₹25L</div>
                  <div className="text-sm text-gray-600">Avg Loan Amount</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
