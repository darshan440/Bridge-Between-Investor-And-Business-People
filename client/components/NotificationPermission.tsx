import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, CheckCircle } from "lucide-react";
import { requestNotificationPermission } from "@/lib/messaging";

interface NotificationPermissionProps {
  userId?: string;
  onPermissionGranted?: (token: string) => void;
  className?: string;
}

export function NotificationPermission({
  userId,
  onPermissionGranted,
  className = "",
}: NotificationPermissionProps) {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const fcmToken = await requestNotificationPermission();

      if (fcmToken) {
        setToken(fcmToken);
        setPermission("granted");
        onPermissionGranted?.(fcmToken);

        // Show success message
        const event = new CustomEvent("notification", {
          detail: {
            title: "Notifications Enabled!",
            body: "You'll now receive important updates about your investments and opportunities.",
            type: "success",
          },
        });
        window.dispatchEvent(event);
      } else {
        setPermission(Notification.permission);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "granted") {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Notifications enabled! You'll receive important updates.
        </AlertDescription>
      </Alert>
    );
  }

  if (permission === "denied") {
    return (
      <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
        <BellOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          Notifications are blocked. Enable them in your browser settings to
          stay updated.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Alert className="border-blue-200 bg-blue-50">
        <Bell className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Enable notifications to receive real-time updates about investment
          opportunities, business proposals, and expert advice.
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleRequestPermission}
        disabled={loading}
        className="w-full"
        variant="outline"
      >
        <Bell className="w-4 h-4 mr-2" />
        {loading ? "Requesting Permission..." : "Enable Notifications"}
      </Button>
    </div>
  );
}

export default NotificationPermission;
