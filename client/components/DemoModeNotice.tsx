import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ExternalLink, Settings } from "lucide-react";

export default function DemoModeNotice() {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-blue-900">
            <Info className="w-5 h-5 mr-2" />
            Demo Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert className="border-blue-200 bg-blue-100/50">
            <AlertDescription className="text-blue-800 text-sm">
              🎯 You're viewing InvestBridge in demo mode. To enable full
              functionality, configure Firebase.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-semibold text-blue-900 text-sm">
              Quick Setup:
            </h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. Create a Firebase project</li>
              <li>2. Copy your config to .env</li>
              <li>3. Enable Authentication</li>
              <li>4. Restart the dev server</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() =>
                window.open("https://console.firebase.google.com/", "_blank")
              }
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Firebase
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() =>
                window.open(
                  "https://github.com/your-username/investbridge#setup",
                  "_blank",
                )
              }
            >
              <Settings className="w-3 h-3 mr-1" />
              Setup Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
