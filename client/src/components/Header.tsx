import { Link, useLocation } from "wouter";
import { Moon, Sun, Search, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // authentication derived from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"admin" | "author" | "reader">("reader");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (adminToken) {
      setIsAuthenticated(true);
      setUserRole('admin');
      setUser({ username: 'Admin' });
    } else if (userToken && userData) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(userData);
      setUserRole(parsedUser.role || 'reader');
      setUser(parsedUser);
    } else {
      setIsAuthenticated(false);
      setUserRole('reader');
      setUser(null);
    }
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Technology", href: "/category/technology" },
    { name: "Business", href: "/category/business" },
    { name: "Design", href: "/category/design" },
    { name: "Lifestyle", href: "/category/lifestyle" },
    { name: "Marketing", href: "/category/marketing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-8">
            <Link href="/">
              <a className="text-xl font-bold text-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
                Testcraft <span className="text-primary">World</span>
              </a>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`px-3 py-2 text-sm font-medium rounded-md hover-elevate ${
                      location === item.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`link-nav-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="w-48 md:w-64"
                  autoFocus
                  data-testid="input-search"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                  data-testid="button-close-search"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchOpen(true)}
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleTheme}
                  data-testid="button-theme-toggle"
                >
                  {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>

                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src="" alt="User" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user?.username || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem data-testid="menu-profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      {(userRole === "admin" || userRole === "author") && (
                        <DropdownMenuItem asChild>
                          <a href={userRole === "admin" ? "/admin" : "/user/dashboard"}> 
                            <Settings className="mr-2 h-4 w-4" />
                            Dashboard
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={async () => {
                        // logout: call server and clear token
                        const adminToken = localStorage.getItem('admin_token');
                        const userToken = localStorage.getItem('token');
                        try {
                          if (adminToken) {
                            await fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
                            localStorage.removeItem('admin_token');
                          } else if (userToken) {
                            await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${userToken}` } });
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                          }
                        } catch(e){}
                        setIsAuthenticated(false);
                        setUserRole('reader');
                        setUser(null);
                        window.location.href = '/';
                      }} data-testid="menu-logout">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <a href="/login"><Button size="sm" data-testid="button-sign-in">Sign In</Button></a>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t py-4">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`px-3 py-2 text-sm font-medium rounded-md hover-elevate ${
                      location === item.href
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
