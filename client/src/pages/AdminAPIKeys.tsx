import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string; // Only shown once after creation
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  isActive: boolean;
}

interface APIKeyResponse {
  success: boolean;
  apiKey?: string;
  keyId?: string;
  name?: string;
  createdAt?: string;
  expiresAt?: string;
  error?: string;
  message?: string;
}

export default function AdminAPIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyExpires, setNewKeyExpires] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('admin_token') || localStorage.getItem('token');
  };

  const fetchAPIKeys = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      const response = await fetch('/api/admin/api-keys', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Note: The API returns keys without the actual key values for security
        // Only the metadata is shown
        setApiKeys(data.keys || []);
      } else {
        console.error('Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) return;

    const token = getAuthToken();
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    setCreating(true);

    try {
      const requestBody: any = {
        name: newKeyName.trim()
      };

      if (newKeyExpires) {
        requestBody.expiresAt = new Date(newKeyExpires).toISOString();
      }

      const response = await fetch('/api/admin/generate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data: APIKeyResponse = await response.json();

      if (data.success && data.apiKey) {
        // Show the key to the user (only shown once)
        setNewlyCreatedKey(data.apiKey);
        setShowKeyDialog(true);

        // Reset form
        setNewKeyName("");
        setNewKeyExpires("");
        setShowCreateDialog(false);

        // Refresh the keys list
        fetchAPIKeys();
      } else {
        alert(`Error: ${data.error || data.message || 'Failed to create API key'}`);
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('Please login as admin first');
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh the keys list
        fetchAPIKeys();
      } else {
        alert('Failed to revoke API key');
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Key className="h-8 w-8 text-green-600" />
            API Key Management
          </h1>
          <p className="mt-2 text-gray-600">Generate and manage API keys for external integrations</p>
        </div>

        <div className="space-y-6">
          {/* Create New Key Button */}
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Create API keys for external applications and services to access your blog's API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Generate New API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for external applications. The key will be shown only once - save it securely.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Mobile App, Integration Service"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                      <Input
                        id="expiresAt"
                        type="datetime-local"
                        value={newKeyExpires}
                        onChange={(e) => setNewKeyExpires(e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Leave empty for no expiration
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createAPIKey} disabled={creating || !newKeyName.trim()}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Key'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Active API Keys</CardTitle>
              <CardDescription>
                Manage your API keys. Keys are hashed for security and cannot be viewed after creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No API keys created yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create your first API key to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
                        <TableCell>
                          {apiKey.expiresAt ? (
                            <span className={isExpired(apiKey.expiresAt) ? 'text-red-600' : ''}>
                              {formatDate(apiKey.expiresAt)}
                            </span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {apiKey.lastUsedAt ? (
                            formatDate(apiKey.lastUsedAt)
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={apiKey.isActive && !isExpired(apiKey.expiresAt) ? "default" : "secondary"}>
                            {apiKey.isActive && !isExpired(apiKey.expiresAt) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeAPIKey(apiKey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use API Keys</CardTitle>
              <CardDescription>
                Instructions for using generated API keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Include the API key in the Authorization header:
                  </p>
                  <code className="block bg-gray-100 p-2 rounded text-sm">
                    Authorization: Bearer ak_1a2b3c4d5e6f7890abcdef1234567890
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Available Endpoints</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><code>GET /api/posts</code> - Fetch blog posts</li>
                    <li><code>GET /api/categories</code> - Get categories</li>
                    <li><code>POST /api/contact</code> - Submit contact form</li>
                    <li><code>POST /api/auth/login</code> - User authentication</li>
                  </ul>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Keep your API keys secure and rotate them regularly.
                    Never commit API keys to version control.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Show Newly Created Key Dialog */}
        <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Created Successfully</DialogTitle>
              <DialogDescription>
                Save this API key securely. It will not be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={newlyCreatedKey || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => newlyCreatedKey && copyToClipboard(newlyCreatedKey)}
                  >
                    {copiedKey === newlyCreatedKey ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This key provides access to your blog's API. Store it securely and never share it publicly.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowKeyDialog(false)}>
                I Have Saved the Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}