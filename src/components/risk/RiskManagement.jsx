
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  ArrowDownUp, 
  Clock, 
  Plus, 
  Shield, 
  ShieldAlert, 
  Trash2 
} from "lucide-react";

const riskLevelColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const demoRisks = [
  {
    id: 1,
    description: "Team member availability might be reduced during holidays",
    impact: "Sprint goals may not be met on time",
    probability: "medium",
    severity: "medium",
    mitigation: "Plan for reduced velocity during holiday periods",
    owner: "Project Manager",
    status: "open",
  },
  {
    id: 2,
    description: "Third-party API integration may be delayed",
    impact: "Feature delivery could be blocked",
    probability: "high",
    severity: "high",
    mitigation: "Develop a mockable interface and continue parallel development",
    owner: "Lead Developer",
    status: "open",
  },
  {
    id: 3,
    description: "New requirements might be introduced mid-sprint",
    impact: "Sprint scope creep",
    probability: "medium",
    severity: "high",
    mitigation: "Enforce sprint planning rules and manage stakeholder expectations",
    owner: "Scrum Master",
    status: "mitigated",
  },
];

const RiskManagement = () => {
  const [risks, setRisks] = useState(demoRisks);
  const [sortBy, setSortBy] = useState("severity");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const sortedRisks = [...risks].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    } else {
      return a[sortBy] < b[sortBy] ? 1 : -1;
    }
  });

  const getRiskIcon = (severity) => {
    switch (severity) {
      case "high":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "low":
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Risk Management</h2>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Risk
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center gap-1">
                    Description
                    {sortBy === "description" && (
                      <ArrowDownUp className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("severity")}
                >
                  <div className="flex items-center gap-1">
                    Severity
                    {sortBy === "severity" && (
                      <ArrowDownUp className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("owner")}
                >
                  <div className="flex items-center gap-1">
                    Owner
                    {sortBy === "owner" && (
                      <ArrowDownUp className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === "status" && (
                      <ArrowDownUp className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedRisks.map((risk) => (
                <tr key={risk.id} className="bg-card hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium">{risk.description}</div>
                    <div className="text-muted-foreground mt-1">{risk.impact}</div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${riskLevelColors[risk.severity]}`}>
                      {getRiskIcon(risk.severity)}
                      <span className="capitalize">{risk.severity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    {risk.owner}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800">
                      <Clock className="h-3 w-3" />
                      <span className="capitalize">{risk.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;
