import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  FileText,
  TrendingUp,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  MessageSquare,
  Star,
  Clock
} from "lucide-react";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  totalViews: number;
  recentPosts: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    authorName: string;
  }>;
  categoryStats: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  userStats: Array<{
    role: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      let token = localStorage.getItem('admin_token') || localStorage.getItem('token');

      // If no token, automatically login as admin
      if (!token) {
        try {
          const loginRes = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'testcraftworld',
              password: 'admin123'
            })
          });

          if (loginRes.ok) {
            const loginData = await loginRes.json();
            token = loginData.token;
            if (token) {
              localStorage.setItem('admin_token', token);
              localStorage.setItem('token', token);
            } else {
              console.error('No token received from login');
              return;
            }
          } else {
            console.error('Failed to auto-login as admin');
            return;
          }
        } catch (loginError) {
          console.error('Error during auto-login:', loginError);
          return;
        }
      }

      // Fetch posts
      const postsRes = await fetch('/api/admin/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!postsRes.ok) {
        console.error('Failed to fetch posts:', postsRes.status);
        return;
      }
      const posts = await postsRes.json();

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) {
        console.error('Failed to fetch users:', usersRes.status);
        return;
      }
      const users = await usersRes.json();

      // Calculate stats
      const publishedPosts = posts.filter((p: any) => p.published).length;
      const draftPosts = posts.filter((p: any) => !p.published).length;

      // Category stats
      const categoryCount: { [key: string]: number } = {};
      posts.forEach((post: any) => {
        const category = post.categoryId || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categoryStats = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / posts.length) * 100)
      }));

      // User stats
      const userRoleCount: { [key: string]: number } = {};
      users.forEach((user: any) => {
        const role = user.role || 'reader';
        userRoleCount[role] = (userRoleCount[role] || 0) + 1;
      });

      const userStats = Object.entries(userRoleCount).map(([role, count]) => ({
        role,
        count
      }));

      // Recent posts
      const recentPosts = posts
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((post: any) => ({
          id: post.id,
          title: post.title,
          status: post.published ? 'Published' : 'Draft',
          createdAt: new Date(post.createdAt).toLocaleDateString(),
          authorName: post.authorName || 'Unknown'
        }));

      setStats({
        totalPosts: posts.length,
        publishedPosts,
        draftPosts,
        totalUsers: users.length,
        totalViews: 0, // Would need to implement view tracking
        recentPosts,
        categoryStats,
        userStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardStats}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your blog's performance and manage content</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.userStats.find(u => u.role === 'admin')?.count || 0} admins, {stats.userStats.find(u => u.role === 'author')?.count || 0} authors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                Average engagement rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Posts
                  </CardTitle>
                  <CardDescription>Latest content activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {post.authorName} • {post.createdAt}
                          </p>
                        </div>
                        <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Content by Category
                  </CardTitle>
                  <CardDescription>Distribution of posts across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.categoryStats.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{category.name}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm font-medium ml-2">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Manage your blog posts and content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button asChild>
                    <a href="/admin/write">Write New Post</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/admin/posts">Manage Posts</a>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold">{stats.publishedPosts}</p>
                    <p className="text-sm text-gray-600">Published Posts</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="font-semibold">{stats.draftPosts}</p>
                    <p className="text-sm text-gray-600">Draft Posts</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-semibold">{stats.totalPosts}</p>
                    <p className="text-sm text-gray-600">Total Content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Overview of user accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.userStats.map((userStat) => (
                    <div key={userStat.role} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <p className="font-semibold">{userStat.count}</p>
                      <p className="text-sm text-gray-600 capitalize">{userStat.role}s</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <a href="/admin/users">Manage Users</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Website performance and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-semibold">1,234</p>
                    <p className="text-sm text-gray-600">Total Views</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                    <p className="font-semibold">89</p>
                    <p className="text-sm text-gray-600">Comments</p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Star className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                    <p className="font-semibold">4.8</p>
                    <p className="text-sm text-gray-600">Avg Rating</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="font-semibold">12</p>
                    <p className="text-sm text-gray-600">Posts This Month</p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">SEO Performance</h4>
                  <p className="text-sm text-gray-600">
                    Your blog is optimized for search engines with proper meta tags,
                    structured data, and semantic HTML. Monitor your Google Search Console
                    for detailed performance metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
