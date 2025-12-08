import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  GraduationCap,
  Upload,
  Search,
  Bell,
  User,
  Menu,
  LogOut,
  Settings,
  BookOpen,
  Home,
  Coins
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";

interface NavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Navigation({ activeTab = 'home', onTabChange = () => { } }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, profile, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const navigate = useNavigate();

  // Role Management with cleaner structure
  const [roleState, setRoleState] = useState({
    roles: [] as string[],
    isAdminRpc: null as boolean | null,
    isLoading: true,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setRoleState({ roles: [], isAdminRpc: null, isLoading: false });
      return;
    }

    let mounted = true;
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    async function loadRoles() {
      try {
        // 1️⃣ Load table roles
        // 1️⃣ Load table roles (from profiles)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const roleList = (profile as any)?.role ? [(profile as any).role] : [];

        // 2️⃣ Load RPC fallback (do not set false if error)
        const { data: rpcData, error: rpcError } = await supabase
          .rpc("has_role", { _user_id: user.id, _role: "admin" })
          .abortSignal(abortController.signal);

        if (!mounted) return;

        setRoleState({
          roles: roleList,
          isAdminRpc: rpcError ? null : Boolean(rpcData),
          isLoading: false,
        });
      } catch (err) {
        if (!mounted) return;
        console.warn("Role load aborted or failed:", err);
        setRoleState({
          roles: [],
          isAdminRpc: null,
          isLoading: false,
        });
      }
    }

    loadRoles();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [user]);

  const { roles, isAdminRpc, isLoading } = roleState;

  // Final admin decision:
  const isAdmin =
    roles.includes("admin") ||
    roles.includes("superadmin") ||
    isAdminRpc === true;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "browse", label: "Browse", icon: Search },
    { id: "upload", label: "Upload", icon: Upload },
  ];

  const displayNotifications = notifications.slice(0, 5); // performance fix

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl hidden sm:block">Resource Hub</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              onClick={() => {
                if (item.id === 'home') {
                  onTabChange('home');
                  navigate('/');
                } else {
                  navigate(`/${item.id}`);
                }
              }}
              className="flex items-center space-x-2"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />

          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all read
                    </Button>
                  )}
                </div>

                <DropdownMenuSeparator />

                {displayNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {displayNotifications.map((notif: any) => (
                      <DropdownMenuItem
                        key={notif.id}
                        className={`flex flex-col items-start p-4 cursor-pointer ${!notif.read ? "bg-primary/5" : ""
                          }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <span className="font-medium">{notif.title}</span>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {notif.message}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Coin Balance Badge */}
              <div className="hidden md:flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-3 py-1.5 rounded-full border border-yellow-500/20">
                <Coins className="h-4 w-4 fill-yellow-500" />
                <span className="font-bold text-sm">{profile?.coins || 0}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <div className="px-4 py-2">
                    <p className="font-medium">{user.email}</p>

                    {!isLoading ? (
                      <p className="text-sm text-muted-foreground">
                        {roles.length > 0 ? roles.join(", ") : "Student"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate("/browse")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Resources
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {/* Secure Admin Button */}
                  {!isLoading && isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/upload")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resource
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")} className="bg-gradient-primary">
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    onClick={() => {
                      requestAnimationFrame(() => onTabChange(item.id));
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
