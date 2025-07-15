"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Globe, Database, Check, X, RefreshCw, Key, Lock, Briefcase } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Connection {
  id: string
  name: string
  type: string
  url: string
  status: "active" | "inactive" | "error"
  lastSync: string
  authType?: "basic" | "oauth2" | "apikey" | "mtls"
  credentials?: {
    clientId?: string
    clientSecret?: string
    apiKey?: string
    certificatePath?: string
  }
  product?: string // For ADP-specific products like Workforce Now, Vantage HCM, etc.
}

const mockConnections: Connection[] = [
  {
    id: "1",
    name: "CRM System",
    type: "REST API",
    url: "https://api.crm-example.com",
    status: "active",
    lastSync: "2025-07-15T12:30:00Z",
    authType: "apikey",
  },
  {
    id: "2",
    name: "ERP Integration",
    type: "SOAP",
    url: "https://erp-services.example.org/soap",
    status: "inactive",
    lastSync: "2025-07-10T09:15:00Z",
    authType: "basic",
  },
  {
    id: "3",
    name: "Analytics Platform",
    type: "GraphQL",
    url: "https://analytics.example.io/graphql",
    status: "error",
    lastSync: "2025-07-14T18:45:00Z",
    authType: "oauth2",
  },
  {
    id: "4",
    name: "ADP Workforce Now",
    type: "REST API",
    url: "https://accounts.adp.com",
    status: "inactive",
    lastSync: "-",
    authType: "oauth2",
    product: "Workforce Now",
    credentials: {
      clientId: "",
      clientSecret: "",
    },
  },
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>(mockConnections)
  const [newConnection, setNewConnection] = useState({
    name: "",
    type: "REST API",
    url: "",
    authType: "basic" as "basic" | "oauth2" | "apikey" | "mtls",
    product: "",
    credentials: {
      clientId: "",
      clientSecret: "",
      apiKey: "",
      username: "",
      password: "",
    },
  })

  const handleAddConnection = () => {
    if (!newConnection.name || !newConnection.url) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and URL for the connection.",
        variant: "destructive",
      })
      return
    }

    // Validate credentials based on auth type
    if (newConnection.authType === "oauth2" && 
        (!newConnection.credentials.clientId || !newConnection.credentials.clientSecret)) {
      toast({
        title: "Missing Credentials",
        description: "Please provide Client ID and Client Secret for OAuth 2.0 authentication.",
        variant: "destructive",
      })
      return
    } else if (newConnection.authType === "apikey" && !newConnection.credentials.apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please provide an API Key for this connection.",
        variant: "destructive",
      })
      return
    }

    const connection: Connection = {
      id: `${connections.length + 1}`,
      name: newConnection.name,
      type: newConnection.type,
      url: newConnection.url,
      status: "inactive",
      lastSync: "-",
      authType: newConnection.authType,
      product: newConnection.product || undefined,
      credentials: {
        clientId: newConnection.credentials.clientId || undefined,
        clientSecret: newConnection.credentials.clientSecret || undefined,
        apiKey: newConnection.credentials.apiKey || undefined,
      },
    }

    setConnections([...connections, connection])
    setNewConnection({
      name: "",
      type: "REST API",
      url: "",
      authType: "basic",
      product: "",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "",
        username: "",
        password: "",
      },
    })
    
    toast({
      title: "Connection Added",
      description: "The new API connection has been added successfully.",
    })
  }

  const toggleConnectionStatus = (id: string) => {
    setConnections(
      connections.map((conn) => {
        if (conn.id === id) {
          const newStatus = conn.status === "active" ? "inactive" : "active"
          return { ...conn, status: newStatus }
        }
        return conn
      })
    )
  }

  const testConnection = (id: string) => {
    // In a real app, this would make an actual API call to test the connection
    toast({
      title: "Testing Connection",
      description: "Attempting to connect to the API endpoint...",
    })
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: "The API endpoint is reachable and responding correctly.",
      })
    }, 1500)
  }

  const syncConnection = (id: string) => {
    // In a real app, this would trigger a data sync with the external API
    toast({
      title: "Syncing Data",
      description: "Starting data synchronization process...",
    })
    
    // Simulate sync with timeout
    setTimeout(() => {
      setConnections(
        connections.map((conn) => {
          if (conn.id === id) {
            return { ...conn, lastSync: new Date().toISOString() }
          }
          return conn
        })
      )
      
      toast({
        title: "Sync Complete",
        description: "Data has been synchronized successfully.",
      })
    }, 2000)
  }

  const getStatusBadge = (status: Connection["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Active</Badge>
      case "inactive":
        return <Badge variant="outline"><X className="h-3 w-3 mr-1" /> Inactive</Badge>
      case "error":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    // Handle special case for "-" or invalid date strings
    if (!dateString || dateString === "-" || isNaN(Date.parse(dateString))) {
      return "Not synchronized yet"
    }
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Connections</h1>
          <p className="text-muted-foreground">
            Manage connections to external systems and APIs
          </p>
        </div>
      </div>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="existing">Existing Connections</TabsTrigger>
          <TabsTrigger value="new">Add New Connection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      {connection.name}
                      {connection.product && (
                        <Badge variant="outline" className="ml-2">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {connection.product}
                        </Badge>
                      )}
                    </span>
                    {getStatusBadge(connection.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{connection.type}</span>
                    {connection.authType && (
                      <Badge variant="secondary" className="text-xs">
                        {connection.authType === "oauth2" && <Key className="h-3 w-3 mr-1" />}
                        {connection.authType === "apikey" && <Key className="h-3 w-3 mr-1" />}
                        {connection.authType === "basic" && <Lock className="h-3 w-3 mr-1" />}
                        {connection.authType === "mtls" && <Lock className="h-3 w-3 mr-1" />}
                        {connection.authType === "oauth2" && "OAuth 2.0"}
                        {connection.authType === "apikey" && "API Key"}
                        {connection.authType === "basic" && "Basic Auth"}
                        {connection.authType === "mtls" && "mTLS"}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">URL:</span> {connection.url}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Last Sync:</span> {formatDate(connection.lastSync)}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={connection.status === "active"} 
                      onCheckedChange={() => toggleConnectionStatus(connection.id)}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testConnection(connection.id)}
                    >
                      Test
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => syncConnection(connection.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Sync
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
                <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Add New API Connection</CardTitle>
              <CardDescription>
                Configure a new connection to an external API or service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Connection Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., CRM System" 
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({...newConnection, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">API Type</Label>
                  <Select 
                    value={newConnection.type}
                    onValueChange={(value) => setNewConnection({...newConnection, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REST API">REST API</SelectItem>
                      <SelectItem value="GraphQL">GraphQL</SelectItem>
                      <SelectItem value="SOAP">SOAP</SelectItem>
                      <SelectItem value="WebSocket">WebSocket</SelectItem>
                      <SelectItem value="gRPC">gRPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="url">API URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://api.example.com" 
                    value={newConnection.url}
                    onChange={(e) => setNewConnection({...newConnection, url: e.target.value})}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="authType">Authentication Type</Label>
                  <Select 
                    value={newConnection.authType}
                    onValueChange={(value: "basic" | "oauth2" | "apikey" | "mtls") => 
                      setNewConnection({...newConnection, authType: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Authentication Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="mtls">Mutual TLS (mTLS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show product selection for ADP connections */}
                {newConnection.name.toLowerCase().includes("adp") && (
                  <div className="grid gap-2">
                    <Label htmlFor="product">ADP Product</Label>
                    <Select 
                      value={newConnection.product}
                      onValueChange={(value) => setNewConnection({...newConnection, product: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ADP Product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Workforce Now">ADP Workforce Now</SelectItem>
                        <SelectItem value="Vantage HCM">ADP Vantage HCM</SelectItem>
                        <SelectItem value="Enterprise HR">ADP Enterprise HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Authentication credentials based on auth type */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="credentials">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Authentication Credentials
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {newConnection.authType === "oauth2" && (
                        <div className="grid gap-4 mt-2">
                          <div className="grid gap-2">
                            <Label htmlFor="clientId">Client ID</Label>
                            <Input 
                              id="clientId" 
                              placeholder="Your OAuth 2.0 Client ID" 
                              value={newConnection.credentials.clientId}
                              onChange={(e) => setNewConnection({
                                ...newConnection, 
                                credentials: {
                                  ...newConnection.credentials,
                                  clientId: e.target.value
                                }
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="clientSecret">Client Secret</Label>
                            <Input 
                              id="clientSecret" 
                              type="password"
                              placeholder="Your OAuth 2.0 Client Secret" 
                              value={newConnection.credentials.clientSecret}
                              onChange={(e) => setNewConnection({
                                ...newConnection, 
                                credentials: {
                                  ...newConnection.credentials,
                                  clientSecret: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {newConnection.authType === "apikey" && (
                        <div className="grid gap-2 mt-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input 
                            id="apiKey" 
                            type="password"
                            placeholder="Your API Key" 
                            value={newConnection.credentials.apiKey}
                            onChange={(e) => setNewConnection({
                              ...newConnection, 
                              credentials: {
                                ...newConnection.credentials,
                                apiKey: e.target.value
                              }
                            })}
                          />
                        </div>
                      )}

                      {newConnection.authType === "basic" && (
                        <div className="grid gap-4 mt-2">
                          <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input 
                              id="username" 
                              placeholder="Username" 
                              value={newConnection.credentials.username}
                              onChange={(e) => setNewConnection({
                                ...newConnection, 
                                credentials: {
                                  ...newConnection.credentials,
                                  username: e.target.value
                                }
                              })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                              id="password" 
                              type="password"
                              placeholder="Password" 
                              value={newConnection.credentials.password}
                              onChange={(e) => setNewConnection({
                                ...newConnection, 
                                credentials: {
                                  ...newConnection.credentials,
                                  password: e.target.value
                                }
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {newConnection.authType === "mtls" && (
                        <div className="grid gap-2 mt-2">
                          <p className="text-sm text-muted-foreground">
                            Mutual TLS requires certificate setup. Please contact your administrator.
                          </p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddConnection}>Add Connection</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
