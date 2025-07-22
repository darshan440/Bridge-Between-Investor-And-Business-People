import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  User,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

interface AvailableRole {
  role: string;
  description: string;
  requiresApproval: boolean;
}

interface RoleInfo {
  currentRole: string;
  currentRoleDescription: string;
  availableRoles: AvailableRole[];
}

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged: (newRole: string) => void;
}

const roleIcons = {
  user: User,
  investor: TrendingUp,
  business_person: Lightbulb,
  business_advisor: MessageSquare,
  banker: DollarSign,
  admin: Shield,
};

const roleColors = {
  user: "bg-gray-100 text-gray-800",
  investor: "bg-green-100 text-green-800",
  business_person: "bg-blue-100 text-blue-800",
  business_advisor: "bg-purple-100 text-purple-800",
  banker: "bg-yellow-100 text-yellow-800",
  admin: "bg-red-100 text-red-800",
};

export function RoleChangeModal({
  isOpen,
  onClose,
  onRoleChanged,
}: RoleChangeModalProps) {
  const { user } = useAuth();
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      loadAvailableRoles();
    }
  }, [isOpen, user]);

  const loadAvailableRoles = async () => {
    if (!functions) {
      setError("Firebase functions not available");
      return;
    }

    try {
      console.log("Loading available roles for user:", user?.uid);
      const getAvailableRoles = httpsCallable(functions, "getAvailableRoles");
      const result = await getAvailableRoles();
      console.log("Available roles result:", result.data);
      setRoleInfo(result.data as RoleInfo);
    } catch (error: any) {
      console.error("Error loading available roles:", error);
      setError(
        `Failed to load available roles: ${error.message || error.code || "Unknown error"}`,
      );
    }
  };

  const handleRoleChange = async () => {
    if (!selectedRole || !functions) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const changeUserRole = httpsCallable(functions, "changeUserRole");
      const result = await changeUserRole({ newRole: selectedRole });

      const data = result.data as {
        success: boolean;
        message: string;
        newRole: string;
      };

      if (data.success) {
        setSuccess(data.message);
        onRoleChanged(data.newRole);

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccess("");
          setSelectedRole("");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error changing role:", error);
      setError(error.message || "Failed to change role");
    } finally {
      setLoading(false);
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || User;
    return <IconComponent className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return (
      roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Change Your Role</span>
          </DialogTitle>
          <DialogDescription>
            Switch to a different role to access new features and capabilities.
            Contact an administrator if your role is restricted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Role */}
          {roleInfo && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Role</label>
              <div className="flex items-center space-x-2">
                <Badge className={getRoleColor(roleInfo.currentRole)}>
                  {getRoleIcon(roleInfo.currentRole)}
                  <span className="ml-1">
                    {formatRoleName(roleInfo.currentRole)}
                  </span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {roleInfo.currentRoleDescription}
              </p>
            </div>
          )}

          {/* Role Selection */}
          {roleInfo && roleInfo.availableRoles.length > 0 ? (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select New Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a new role" />
                </SelectTrigger>
                <SelectContent>
                  {roleInfo.availableRoles.map((role) => (
                    <SelectItem key={role.role} value={role.role}>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(role.role)}
                        <span>{formatRoleName(role.role)}</span>
                        {role.requiresApproval && (
                          <Badge variant="outline" className="text-xs">
                            Approval Required
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Role Description */}
              {selectedRole && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-1">
                    {formatRoleName(selectedRole)}
                  </h4>
                  <p className="text-sm text-blue-800">
                    {
                      roleInfo.availableRoles.find(
                        (r) => r.role === selectedRole,
                      )?.description
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No role changes are available for your current role. Contact an
                administrator if you need to change to a restricted role.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Role Change Rules */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Role Change Rules
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• You can only change your own role</li>
              <li>
                • Some roles like 'banker' and 'admin' require special
                permissions
              </li>
              <li>• Role changes are logged for security purposes</li>
              <li>
                • You can change your role again at any time within allowed
                transitions
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRoleChange}
            disabled={!selectedRole || loading || success !== ""}
          >
            {loading ? "Changing Role..." : "Change Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoleChangeModal;
