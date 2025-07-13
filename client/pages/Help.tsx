import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Building,
  ArrowLeft,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Users,
  Shield,
  TrendingUp,
  Lightbulb,
  DollarSign,
  User,
  HelpCircle,
} from "lucide-react";

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I get started on InvestBridge?",
        answer:
          "Simply create an account and choose your role (User, Investor, Business Person, or Business Advisor). Each role has different features and capabilities. You can always change your role later from your dashboard.",
      },
      {
        question: "What are the different user roles?",
        answer:
          "We have 5 roles: User (browse opportunities), Investor (invest in businesses), Business Person (post business ideas), Business Advisor (provide expert advice), and Banker (create loan schemes). Each role has specific features designed for their needs.",
      },
      {
        question: "Can I change my role after registration?",
        answer:
          "Yes! You can change your role anytime from your dashboard. Click 'Change Role' in the sidebar. Note that some roles like Banker and Admin require special permissions.",
      },
    ],
  },
  {
    category: "For Investors",
    questions: [
      {
        question: "How do I find investment opportunities?",
        answer:
          "Navigate to 'View Business Ideas' from your investor dashboard. You can filter by category, funding amount, location, and other criteria to find opportunities that match your investment preferences.",
      },
      {
        question: "How do I make an investment proposal?",
        answer:
          "Once you find an interesting business idea, click 'View Details' and then 'Make Proposal'. Fill in your investment amount, terms, and any conditions. The business owner will be notified of your proposal.",
      },
      {
        question: "Can I track my investment portfolio?",
        answer:
          "Yes! The Portfolio Tracking feature allows you to monitor all your investments, view returns, and get analytics on your investment performance.",
      },
    ],
  },
  {
    category: "For Business Owners",
    questions: [
      {
        question: "How do I post my business idea?",
        answer:
          "Go to 'Post Business Idea' from your dashboard. Provide detailed information about your business, funding requirements, market analysis, and team. The more detailed your post, the more likely you are to attract investors.",
      },
      {
        question: "What information should I include in my business idea?",
        answer:
          "Include your business concept, target market, revenue model, funding requirements, team information, and competitive advantages. Add visuals and documents if possible.",
      },
      {
        question: "How do I respond to investment proposals?",
        answer:
          "You'll receive notifications when investors make proposals. Review them in your dashboard under 'Investment Proposals' and respond with acceptance, counter-offer, or rejection.",
      },
    ],
  },
  {
    category: "For Business Advisors",
    questions: [
      {
        question: "How can I provide advice to entrepreneurs?",
        answer:
          "You can answer business queries, post general tips and advice, and provide personalized suggestions to business owners. Your expertise helps entrepreneurs make better decisions.",
      },
      {
        question: "How do I build my reputation as an advisor?",
        answer:
          "Consistently provide valuable advice, respond to queries thoughtfully, and engage with the community. Your profile will show your expertise areas and success rate.",
      },
    ],
  },
  {
    category: "Platform Features",
    questions: [
      {
        question: "Is my data secure on InvestBridge?",
        answer:
          "Yes, we use enterprise-grade security measures including encrypted data storage, secure authentication, and regular security audits. Your personal and financial information is protected.",
      },
      {
        question: "How do notifications work?",
        answer:
          "You'll receive notifications for important events like new investment proposals, messages, and platform updates. You can customize your notification preferences in settings.",
      },
      {
        question: "Can I use InvestBridge on mobile devices?",
        answer:
          "Yes! Our platform is fully responsive and works seamlessly on all devices including smartphones and tablets.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    questions: [
      {
        question: "I'm having trouble logging in",
        answer:
          "Make sure you're using the correct email and password. If you forgot your password, use the 'Reset Password' link on the login page. If issues persist, contact our support team.",
      },
      {
        question: "Why can't I change to certain roles?",
        answer:
          "Some roles like Banker and Admin are restricted and require special approval. You can only change between User, Investor, Business Person, and Business Advisor roles freely.",
      },
      {
        question: "My notifications aren't working",
        answer:
          "Check if you've granted notification permissions in your browser. You can also re-enable notifications from your dashboard settings.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Mail,
    title: "Email Support",
    description: "Get help via email",
    contact: "support@investbridge.com",
    responseTime: "24-48 hours",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team",
    contact: "Available 9 AM - 6 PM IST",
    responseTime: "Instant",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak with our team",
    contact: "+91 1800-123-4567",
    responseTime: "Business hours",
  },
];

const quickLinks = [
  {
    icon: User,
    title: "Getting Started Guide",
    description: "Learn the basics of InvestBridge",
  },
  {
    icon: TrendingUp,
    title: "Investor Handbook",
    description: "Complete guide for investors",
  },
  {
    icon: Lightbulb,
    title: "Business Owner Guide",
    description: "How to succeed as an entrepreneur",
  },
  {
    icon: MessageCircle,
    title: "Advisor Resources",
    description: "Tools and tips for advisors",
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Learn about our security measures",
  },
  {
    icon: DollarSign,
    title: "Pricing & Plans",
    description: "Understand our pricing structure",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...faqData.map((cat) => cat.category)];

  const filteredFAQs = faqData.filter((category) => {
    const categoryMatch =
      selectedCategory === "All" || category.category === selectedCategory;
    const searchMatch =
      searchQuery === "" ||
      category.questions.some(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return categoryMatch && searchMatch;
  });

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
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Help Center
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
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions, guides, and contact our support
            team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <link.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`${categoryIndex}-${faqIndex}`}
                        >
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Contact Support
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <method.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900 mb-1">
                    {method.contact}
                  </p>
                  <p className="text-sm text-gray-600">
                    Response time: {method.responseTime}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-900">Still need help?</CardTitle>
            <CardDescription className="text-blue-700">
              Can't find what you're looking for? Our support team is here to
              help.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
