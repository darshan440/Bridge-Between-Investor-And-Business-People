import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  Check,
  X,
  TrendingUp,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Building,
  Settings,
} from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { getCurrentUserProfile } from "@/lib/auth";

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: any;
  updatedAt: any;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile?.uid) {
      setupNotificationListener();
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const setupNotificationListener = () => {
    if (!userProfile?.uid) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userProfile.uid),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter((n) => !n.read).length);
    });

    return unsubscribe;
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const markNotificationAsRead = httpsCallable(
        functions,
        "markNotificationAsRead",
      );
      await markNotificationAsRead({ notificationId });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      const promises = unreadNotifications.map((n) => markAsRead(n.id));
      await Promise.all(promises);

      toast({
        title: "Success",
        description: "All notifications marked as read.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_BUSINESS_IDEA":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "NEW_INVESTMENT_PROPOSAL":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case "SOLUTION_RECEIVED":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "NEW_LOAN_SCHEME":
        return <Building className="w-4 h-4 text-orange-600" />;
      case "SYSTEM_NOTIFICATION":
        return <Settings className="w-4 h-4 text-gray-600" />;
      case "APPROVAL_REQUEST":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_BUSINESS_IDEA":
        return "bg-blue-50 border-blue-200";
      case "NEW_INVESTMENT_PROPOSAL":
        return "bg-green-50 border-green-200";
      case "SOLUTION_RECEIVED":
        return "bg-purple-50 border-purple-200";
      case "NEW_LOAN_SCHEME":
        return "bg-orange-50 border-orange-200";
      case "SYSTEM_NOTIFICATION":
        return "bg-gray-50 border-gray-200";
      case "APPROVAL_REQUEST":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
                className="text-blue-600 hover:text-blue-700"
              >
                {loading ? "..." : "Mark all read"}
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-blue-600">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
