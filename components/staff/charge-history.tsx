"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  History,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useChargeHistory } from "@/hooks/use-billing";
import { ChargeType, type ChargeWithDetails } from "@/lib/types/billing";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface ChargeHistoryProps {
  staffId: string;
  onExportData?: (data: any[]) => void;
}

// Mock historical charge data
const mockChargeHistory: (ChargeWithDetails & {
  monthYear: string;
  isRecurring: boolean;
  changeFromPrevious?: number;
})[] = [
  // January 2024
  {
    id: "1",
    staffId: "staff-1",
    billingPeriodId: "bp-1",
    type: ChargeType.RENT,
    amount: 850.0,
    description: "Monthly rent for Room 204, Riverside Apartments",
    prorationFactor: 1.0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    monthYear: "2024-01",
    isRecurring: true,
    changeFromPrevious: 0,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      status: "completed" as any,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
  {
    id: "2",
    staffId: "staff-1",
    billingPeriodId: "bp-1",
    type: ChargeType.UTILITIES,
    amount: 125.5,
    description: "Electricity and water usage",
    prorationFactor: 1.0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    monthYear: "2024-01",
    isRecurring: true,
    changeFromPrevious: 15.5,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-1",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      status: "completed" as any,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  },
  // December 2023
  {
    id: "3",
    staffId: "staff-1",
    billingPeriodId: "bp-2",
    type: ChargeType.RENT,
    amount: 850.0,
    description: "Monthly rent for Room 204, Riverside Apartments",
    prorationFactor: 1.0,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
    monthYear: "2023-12",
    isRecurring: true,
    changeFromPrevious: 0,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-2",
      startDate: new Date("2023-12-01"),
      endDate: new Date("2023-12-31"),
      status: "completed" as any,
      createdAt: new Date("2023-12-01"),
      updatedAt: new Date("2023-12-01"),
    },
  },
  {
    id: "4",
    staffId: "staff-1",
    billingPeriodId: "bp-2",
    type: ChargeType.UTILITIES,
    amount: 110.0,
    description: "Electricity and water usage",
    prorationFactor: 1.0,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
    monthYear: "2023-12",
    isRecurring: true,
    changeFromPrevious: -5.0,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-2",
      startDate: new Date("2023-12-01"),
      endDate: new Date("2023-12-31"),
      status: "completed" as any,
      createdAt: new Date("2023-12-01"),
      updatedAt: new Date("2023-12-01"),
    },
  },
  // November 2023
  {
    id: "5",
    staffId: "staff-1",
    billingPeriodId: "bp-3",
    type: ChargeType.RENT,
    amount: 850.0,
    description: "Monthly rent for Room 204, Riverside Apartments",
    prorationFactor: 1.0,
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2023-11-01"),
    monthYear: "2023-11",
    isRecurring: true,
    changeFromPrevious: 0,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-3",
      startDate: new Date("2023-11-01"),
      endDate: new Date("2023-11-30"),
      status: "completed" as any,
      createdAt: new Date("2023-11-01"),
      updatedAt: new Date("2023-11-01"),
    },
  },
  {
    id: "6",
    staffId: "staff-1",
    billingPeriodId: "bp-3",
    type: ChargeType.UTILITIES,
    amount: 115.0,
    description: "Electricity and water usage",
    prorationFactor: 1.0,
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2023-11-01"),
    monthYear: "2023-11",
    isRecurring: true,
    changeFromPrevious: 10.0,
    staff: {
      id: "staff-1",
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
    },
    billingPeriod: {
      id: "bp-3",
      startDate: new Date("2023-11-01"),
      endDate: new Date("2023-11-30"),
      status: "completed" as any,
      createdAt: new Date("2023-11-01"),
      updatedAt: new Date("2023-11-01"),
    },
  },
];

const chargeTypeConfig = {
  [ChargeType.RENT]: { label: "Rent", color: "bg-blue-100 text-blue-800" },
  [ChargeType.UTILITIES]: {
    label: "Utilities",
    color: "bg-yellow-100 text-yellow-800",
  },
  [ChargeType.TRANSPORT]: {
    label: "Transport",
    color: "bg-green-100 text-green-800",
  },
  [ChargeType.OTHER]: { label: "Other", color: "bg-gray-100 text-gray-800" },
};

export function ChargeHistory({ staffId, onExportData }: ChargeHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [selectedCharge, setSelectedCharge] = useState<any>(null);

  // In real implementation, this would fetch data based on staffId and filters
  const dateRangeForHook =
    dateRange.from && dateRange.to
      ? {
          start: dateRange.from,
          end: dateRange.to,
        }
      : undefined;
  const { history, isLoading, error } = useChargeHistory(
    staffId,
    dateRangeForHook
  );

  // Use mock data for demonstration
  const chargeHistory = mockChargeHistory;

  // Filter charges based on search and filters
  const filteredCharges = chargeHistory.filter((charge) => {
    const matchesSearch =
      searchTerm === "" ||
      charge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chargeTypeConfig[charge.type].label
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || charge.type === typeFilter;

    const chargeDate = charge.billingPeriod.startDate;
    const matchesDateRange =
      !dateRange.from ||
      !dateRange.to ||
      (chargeDate >= dateRange.from && chargeDate <= dateRange.to);

    return matchesSearch && matchesType && matchesDateRange;
  });

  // Group charges by month for analysis
  const chargesByMonth = filteredCharges.reduce((acc, charge) => {
    const monthKey = charge.monthYear;
    if (!acc[monthKey]) {
      acc[monthKey] = { charges: [], total: 0 };
    }
    acc[monthKey].charges.push(charge);
    acc[monthKey].total += charge.amount;
    return acc;
  }, {} as Record<string, { charges: any[]; total: number }>);

  // Calculate trends
  const monthlyTotals = Object.entries(chargesByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, total: data.total }));

  const averageMonthly =
    monthlyTotals.length > 0
      ? monthlyTotals.reduce((sum, m) => sum + m.total, 0) /
        monthlyTotals.length
      : 0;

  const totalCharges = filteredCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );

  // Calculate charge type distribution
  const chargesByType = filteredCharges.reduce((acc, charge) => {
    acc[charge.type] = (acc[charge.type] || 0) + charge.amount;
    return acc;
  }, {} as Record<ChargeType, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading charge history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Failed to load charge history
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Charge History
              </CardTitle>
              <CardDescription>
                Detailed breakdown and trends of your historical charges
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => onExportData?.(filteredCharges)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Charges
                        </p>
                        <p className="text-2xl font-bold">
                          ${totalCharges.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {filteredCharges.length} total charges
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Monthly Average
                        </p>
                        <p className="text-2xl font-bold">
                          ${averageMonthly.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Over {monthlyTotals.length} months
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Highest Month
                        </p>
                        <p className="text-2xl font-bold">
                          $
                          {Math.max(
                            ...monthlyTotals.map((m) => m.total),
                            0
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-red-100 p-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Peak spending month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Recurring Charges
                        </p>
                        <p className="text-2xl font-bold">
                          {filteredCharges.filter((c) => c.isRecurring).length}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <PieChart className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Regular monthly charges
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charge Type Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Charge Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of charges by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(chargesByType).map(([type, amount]) => {
                      const config = chargeTypeConfig[type as ChargeType];
                      const percentage =
                        totalCharges > 0 ? (amount / totalCharges) * 100 : 0;

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  config.color.split(" ")[0]
                                )}
                              />
                              <span className="text-sm font-medium">
                                {config.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                ${amount.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                  <CardDescription>
                    Your spending patterns over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyTotals.map((month, index) => {
                      const previousMonth = monthlyTotals[index - 1];
                      const change = previousMonth
                        ? ((month.total - previousMonth.total) /
                            previousMonth.total) *
                          100
                        : 0;

                      return (
                        <div
                          key={month.month}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(month.month + "-01"),
                                "MMMM yyyy"
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {chargesByMonth[month.month]?.charges.length || 0}{" "}
                              charges
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${month.total.toLocaleString()}
                            </p>
                            {previousMonth && (
                              <div className="flex items-center gap-1">
                                {change >= 0 ? (
                                  <TrendingUp className="h-3 w-3 text-red-500" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-green-500" />
                                )}
                                <span
                                  className={cn(
                                    "text-xs",
                                    change >= 0
                                      ? "text-red-600"
                                      : "text-green-600"
                                  )}
                                >
                                  {Math.abs(change).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search charges..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(chargeTypeConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DateRangePicker 
                  date={dateRange} 
                  onDateChange={(date: DateRange | undefined) => {
                    if (date) {
                      setDateRange(date)
                    }
                  }} 
                />
              </div>

              {/* Detailed Charges Table */}
              {filteredCharges.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCharges.map((charge) => {
                        const config = chargeTypeConfig[charge.type];

                        return (
                          <TableRow key={charge.id}>
                            <TableCell>
                              <div className="text-sm">
                                {format(
                                  charge.billingPeriod.startDate,
                                  "MMM dd, yyyy"
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {charge.description}
                                </div>
                                {charge.isRecurring && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {charge.changeFromPrevious !== undefined &&
                              charge.changeFromPrevious !== 0 ? (
                                <div className="flex items-center gap-1">
                                  {charge.changeFromPrevious > 0 ? (
                                    <TrendingUp className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 text-green-500" />
                                  )}
                                  <span
                                    className={cn(
                                      "text-xs",
                                      charge.changeFromPrevious > 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                    )}
                                  >
                                    $
                                    {Math.abs(
                                      charge.changeFromPrevious
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${charge.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCharge(charge)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Historical Charge Details
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed information about this historical
                                      charge
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedCharge && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Billing Period
                                          </p>
                                          <p className="text-sm">
                                            {format(
                                              selectedCharge.billingPeriod
                                                .startDate,
                                              "MMM dd"
                                            )}{" "}
                                            -{" "}
                                            {format(
                                              selectedCharge.billingPeriod
                                                .endDate,
                                              "MMM dd, yyyy"
                                            )}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Amount
                                          </p>
                                          <p className="text-lg font-semibold">
                                            $
                                            {selectedCharge.amount.toLocaleString()}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Type
                                          </p>
                                          <Badge
                                            variant="outline"
                                            className={
                                              chargeTypeConfig[
                                                selectedCharge.type as keyof typeof chargeTypeConfig
                                              ]?.color ||
                                              "bg-gray-100 text-gray-800"
                                            }
                                          >
                                            {chargeTypeConfig[
                                              selectedCharge.type as keyof typeof chargeTypeConfig
                                            ]?.label || "Unknown"}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Status
                                          </p>
                                          <Badge variant="outline">
                                            {selectedCharge.isRecurring
                                              ? "Recurring"
                                              : "One-time"}
                                          </Badge>
                                        </div>
                                      </div>

                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">
                                          Description
                                        </p>
                                        <p className="text-sm bg-muted p-3 rounded-md">
                                          {selectedCharge.description}
                                        </p>
                                      </div>

                                      {selectedCharge.changeFromPrevious !==
                                        undefined &&
                                        selectedCharge.changeFromPrevious !==
                                          0 && (
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                              Change from Previous
                                            </p>
                                            <div className="flex items-center gap-2">
                                              {selectedCharge.changeFromPrevious >
                                              0 ? (
                                                <TrendingUp className="h-4 w-4 text-red-500" />
                                              ) : (
                                                <TrendingDown className="h-4 w-4 text-green-500" />
                                              )}
                                              <span
                                                className={cn(
                                                  "font-medium",
                                                  selectedCharge.changeFromPrevious >
                                                    0
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                )}
                                              >
                                                {selectedCharge.changeFromPrevious >
                                                0
                                                  ? "+"
                                                  : ""}
                                                $
                                                {selectedCharge.changeFromPrevious.toFixed(
                                                  2
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Historical Charges
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || typeFilter !== "all"
                      ? "No charges match your current filters."
                      : "No charge history available for the selected period."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
