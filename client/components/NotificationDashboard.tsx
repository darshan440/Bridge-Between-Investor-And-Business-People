import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Settings, BellOff } from "lucide-react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  NotificationData,
  requestNotificationPermission,
} from "@/lib/messaging";
import { useAuth } from "@/lib/AuthContext";
import { formatDistanceToNow } from "date-fns";

export function NotificationDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    Notification.permission,
  );

  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user?.uid]);

  const loadNotifications = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userNotifications = await getUserNotifications(user.uid, 50);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.uid) return;

    try {
      const count = await getUnreadNotificationCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setPermissionStatus("granted");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_BUSINESS_PROPOSAL":
        return "💼";
      case "NEW_INVESTMENT_PROPOSAL":
        return "💰";
      case "NEW_QUERY":
        return "❓";
      case "NEW_RESPONSE":
        return "💬";
      case "NEW_ADVISOR_TIP":
        return "💡";
      case "PROPOSAL_STATUS_UPDATE":
        return "📊";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_BUSINESS_PROPOSAL":
        return "bg-blue-100 text-blue-800";
      case "NEW_INVESTMENT_PROPOSAL":
        return "bg-green-100 text-green-800";
      case "NEW_QUERY":
        return "bg-yellow-100 text-yellow-800";
      case "NEW_RESPONSE":
        return "bg-purple-100 text-purple-800";
      case "NEW_ADVISOR_TIP":
        return "bg-orange-100 text-orange-800";
      case "PROPOSAL_STATUS_UPDATE":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    if (!timestamp?.seconds) return "Just now";

    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <CardTitle>Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {permissionStatus === "granted" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
            >
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {permissionStatus === "denied" && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <BellOff className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <h3 className="font-medium text-orange-800">
                  Notifications Blocked
                </h3>
                <p className="text-sm text-orange-700">
                  Please enable notifications in your browser settings to
                  receive updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {permissionStatus === "default" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-800">
                    Enable Notifications
                  </h3>
                  <p className="text-sm text-blue-700">
                    Stay updated with real-time notifications about your
                    investments and opportunities.
                  </p>
                </div>
              </div>
              <Button onClick={handleEnableNotifications} size="sm">
                Enable
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-gray-600">
              You'll see your notifications here when you receive them.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-blue-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <h4
                        className={`font-medium ${
                          notification.read ? "text-gray-700" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <Badge
                        className={`text-xs ${getNotificationColor(
                          notification.type,
                        )}`}
                        variant="secondary"
                      >
                        {notification.type.replace(/_/g, " ").toLowerCase()}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm ${
                        notification.read ? "text-gray-600" : "text-gray-800"
                      }`}
                    >
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id!)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationDashboard;
