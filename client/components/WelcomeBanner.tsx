import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Zap, ArrowRight } from "lucide-react";

interface WelcomeBannerProps {
  onUpgradeRole: () => void;
}

export function WelcomeBanner({ onUpgradeRole }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome banner before
    const hasSeenBanner = localStorage.getItem("hasSeenWelcomeBanner");
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenWelcomeBanner", "true");
  };

  const handleUpgrade = () => {
    onUpgradeRole();
    handleDismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200 mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-900">
              👋 Welcome to InvestBridge!
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-blue-800">
            You're currently a general user. Want to explore business or
            investor features? Upgrade your role to unlock powerful features and
            connect with entrepreneurs, investors, and advisors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpgrade}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Role
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              I'll explore as a user for now
            </Button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="font-medium text-blue-900">💰 Investor</div>
              <div className="text-xs text-blue-700">
                Invest in promising startups
              </div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="font-medium text-blue-900">💡 Entrepreneur</div>
              <div className="text-xs text-blue-700">
                Share your business ideas
              </div>
            </div>
            <div className="text-center p-3 bg-white/50 rounded-lg">
              <div className="font-medium text-blue-900">💬 Advisor</div>
              <div className="text-xs text-blue-700">
                Provide expert guidance
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeBanner;
