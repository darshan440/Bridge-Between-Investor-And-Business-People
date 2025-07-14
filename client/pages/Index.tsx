import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  Building,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DemoModeNotice from "@/components/DemoModeNotice";
import { isFirebaseEnabled } from "@/lib/firebase";
import { getCurrentUserProfile } from "@/lib/auth";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">InvestBridge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Bridge Between
            <span className="text-blue-600 block">
              Investors & Entrepreneurs
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect visionary entrepreneurs with smart investors on India's
            premier investment platform. Transform innovative ideas into
            successful ventures with expert guidance and financial backing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <InvestorCTAButton />
            <BusinessCTAButton />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose InvestBridge?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects the right people at the right time with the
              right opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* For Investors */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  For Investors
                </h3>
              </div>
              <div className="space-y-4">
                <Card className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Curated Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Access vetted business proposals from promising
                      entrepreneurs across diverse industries
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Get detailed insights and expert analysis to make informed
                      investment decisions
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-blue-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Portfolio Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Monitor your investments and track performance with
                      real-time updates
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* For Entrepreneurs */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  For Entrepreneurs
                </h3>
              </div>
              <div className="space-y-4">
                <Card className="border-green-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Expert Mentorship</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Connect with experienced business advisors and industry
                      experts for guidance
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-green-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Funding Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Showcase your ideas to qualified investors and secure the
                      funding you need
                    </CardDescription>
                  </CardContent>
                </Card>
                <Card className="border-green-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Business Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Access banking solutions, loan schemes, and comprehensive
                      business support
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Trusted Platform Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Verified
              </h3>
              <p className="text-gray-600">
                All users are verified and transactions are secured with
                bank-level encryption
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Network
              </h3>
              <p className="text-gray-600">
                Connect with business advisors, bankers, and industry experts
                for comprehensive support
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Growth Focused
              </h3>
              <p className="text-gray-600">
                Tools and resources designed to help businesses grow and
                investors maximize returns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of investors and entrepreneurs building the future
            together
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Join InvestBridge Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Demo Mode Notice */}
      {!isFirebaseEnabled && <DemoModeNotice />}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">InvestBridge</h3>
              </div>
              <p className="text-gray-400">
                Connecting investors with entrepreneurs to build India's startup
                ecosystem.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>For Investors</li>
                <li>For Entrepreneurs</li>
                <li>Business Advisors</li>
                <li>Banking Partners</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Investment Guide</li>
                <li>Success Stories</li>
                <li>Market Insights</li>
                <li>Support Center</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 darshanthakkar782@gmail.com</p>
                <p>📞 7383791013</p>
                <p>📍 Ahmedabad, Gujarat</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InvestBridge. All rights reserved.</p>
            <p className="mt-2 flex items-center justify-center">
              ❤️ Made with love by{" "}
              <span className="ml-1 font-semibold text-white">
                Darshan Thakkar
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
