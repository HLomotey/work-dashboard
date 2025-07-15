"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Database, FileSpreadsheet, BarChart3, Download, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface DataSource {
  id: string
  name: string
  type: string
  connectionId: string
  connectionName: string
  lastUpdated: string
  recordCount: number
  status: "available" | "syncing" | "error"
}

const mockDataSources: DataSource[] = [
  {
    id: "1",
    name: "Customer Data",
    type: "REST API Endpoint",
    connectionId: "1",
    connectionName: "CRM System",
    lastUpdated: "2025-07-15T14:30:00Z",
    recordCount: 1243,
    status: "available",
  },
  {
    id: "2",
    name: "Sales Transactions",
    type: "Database Table",
    connectionId: "2",
    connectionName: "ERP Integration",
    lastUpdated: "2025-07-10T09:15:00Z",
    recordCount: 5678,
    status: "available",
  },
  {
    id: "3",
    name: "User Analytics",
    type: "GraphQL Query",
    connectionId: "3",
    connectionName: "Analytics Platform",
    lastUpdated: "2025-07-14T18:45:00Z",
    recordCount: 0,
    status: "error",
  },
]

const mockConnections = [
  { id: "1", name: "CRM System" },
  { id: "2", name: "ERP Integration" },
  { id: "3", name: "Analytics Platform" },
]

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources)
  const [syncingSource, setSyncingSource] = useState<string | null>(null)
  const [syncProgress, setSyncProgress] = useState(0)
  const [newDataSource, setNewDataSource] = useState({
    name: "",
    type: "REST API Endpoint",
    connectionId: "",
    endpoint: "",
  })

  const handleAddDataSource = () => {
    if (!newDataSource.name || !newDataSource.connectionId || !newDataSource.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please provide all required information for the data source.",
        variant: "destructive",
      })
      return
    }

    const connectionName = mockConnections.find(c => c.id === newDataSource.connectionId)?.name || "Unknown"
    
    const dataSource: DataSource = {
      id: `${dataSources.length + 1}`,
      name: newDataSource.name,
      type: newDataSource.type,
      connectionId: newDataSource.connectionId,
      connectionName,
      lastUpdated: new Date().toISOString(),
      recordCount: 0,
      status: "available",
    }

    setDataSources([...dataSources, dataSource])
    setNewDataSource({ name: "", type: "REST API Endpoint", connectionId: "", endpoint: "" })
    
    toast({
      title: "Data Source Added",
      description: "The new data source has been added successfully.",
    })
  }

  const syncDataSource = (id: string) => {
    // In a real app, this would trigger a data sync with the external API
    toast({
      title: "Syncing Data Source",
      description: "Starting data synchronization process...",
    })
    
    setSyncingSource(id)
    setSyncProgress(0)
    
    // Simulate sync progress with intervals
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setSyncingSource(null)
          
          // Update the data source with new information
          setDataSources(
            dataSources.map((source) => {
              if (source.id === id) {
                return { 
                  ...source, 
                  lastUpdated: new Date().toISOString(),
                  recordCount: source.recordCount + Math.floor(Math.random() * 100),
                  status: "available"
                }
              }
              return source
            })
          )
          
          toast({
            title: "Sync Complete",
            description: "Data source has been synchronized successfully.",
          })
          
          return 0
        }
        return prev + 10
      })
    }, 300)
    
    return () => clearInterval(interval)
  }

  const deleteDataSource = (id: string) => {
    setDataSources(dataSources.filter(source => source.id !== id))
    toast({
      title: "Data Source Deleted",
      description: "The data source has been removed successfully.",
    })
  }

  const downloadData = (id: string) => {
    // In a real app, this would generate and download a file with the data
    toast({
      title: "Preparing Download",
      description: "Generating data export file...",
    })
    
    setTimeout(() => {
      toast({
        title: "Download Ready",
        description: "Your data export is ready for download.",
      })
      
      // Simulate file download
      const dataSource = dataSources.find(source => source.id === id)
      if (dataSource) {
        const fileName = `${dataSource.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`
        const dummyLink = document.createElement('a')
        dummyLink.href = '#'
        dummyLink.setAttribute('download', fileName)
        dummyLink.click()
      }
    }, 1500)
  }

  const getStatusBadge = (status: DataSource["status"]) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>
      case "syncing":
        return <Badge variant="secondary">Syncing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
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
          <h1 className="text-3xl font-bold">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage data sources from external systems and APIs
          </p>
        </div>
      </div>

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="existing">Existing Data Sources</TabsTrigger>
          <TabsTrigger value="new">Add New Data Source</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing">
          <Card>
            <CardHeader>
              <CardTitle>Available Data Sources</CardTitle>
              <CardDescription>
                Data sources connected to external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Connection</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell className="font-medium">{source.name}</TableCell>
                      <TableCell>{source.type}</TableCell>
                      <TableCell>{source.connectionName}</TableCell>
                      <TableCell>{formatDate(source.lastUpdated)}</TableCell>
                      <TableCell>{source.recordCount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(source.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => syncDataSource(source.id)}
                            disabled={syncingSource === source.id}
                          >
                            {syncingSource === source.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                <Progress value={syncProgress} className="w-8 h-2" />
                              </>
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadData(source.id)}
                            disabled={source.status !== "available" || source.recordCount === 0}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the "{source.name}" data source? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {}}>Cancel</Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => deleteDataSource(source.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Add New Data Source</CardTitle>
              <CardDescription>
                Configure a new data source from an existing API connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Data Source Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Customer Data" 
                    value={newDataSource.name}
                    onChange={(e) => setNewDataSource({...newDataSource, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="type">Data Source Type</Label>
                  <Select 
                    value={newDataSource.type}
                    onValueChange={(value) => setNewDataSource({...newDataSource, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Data Source Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REST API Endpoint">REST API Endpoint</SelectItem>
                      <SelectItem value="GraphQL Query">GraphQL Query</SelectItem>
                      <SelectItem value="Database Table">Database Table</SelectItem>
                      <SelectItem value="CSV File">CSV File</SelectItem>
                      <SelectItem value="JSON Feed">JSON Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="connection">API Connection</Label>
                  <Select 
                    value={newDataSource.connectionId}
                    onValueChange={(value) => setNewDataSource({...newDataSource, connectionId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API Connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockConnections.map(connection => (
                        <SelectItem key={connection.id} value={connection.id}>
                          {connection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="endpoint">Endpoint / Resource Path</Label>
                  <Input 
                    id="endpoint" 
                    placeholder="/api/customers or table_name" 
                    value={newDataSource.endpoint}
                    onChange={(e) => setNewDataSource({...newDataSource, endpoint: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddDataSource}>Add Data Source</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
