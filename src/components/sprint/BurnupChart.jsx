
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const BurnupChart = ({
  sprintData,
  isLoading = false,
  height = 300,
  showCard = true,
}) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Sprint Burnup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="w-full h-[250px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default data if none provided
  const defaultData = [
    { day: "Day 1", completed: 0, ideal: 2 },
    { day: "Day 2", completed: 3, ideal: 4 },
    { day: "Day 3", completed: 5, ideal: 6 },
    { day: "Day 4", completed: 7, ideal: 8 },
    { day: "Day 5", completed: 9, ideal: 10 },
    { day: "Day 6", completed: 10, ideal: 12 },
    { day: "Day 7", completed: 12, ideal: 14 },
    { day: "Day 8", completed: 13, ideal: 16 },
    { day: "Day 9", completed: 16, ideal: 18 },
    { day: "Day 10", completed: 19, ideal: 20 },
  ];

  const data = sprintData || defaultData;

  // Identify max values for Y-axis scaling
  const maxIdeal = Math.max(...data.map((item) => item.ideal || 0)) * 1.1;
  const maxCompleted = Math.max(...data.map((item) => item.completed || 0)) * 1.1;
  const maxValue = Math.max(maxIdeal, maxCompleted);

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#888" }}
          tickLine={{ stroke: "#888" }}
        />
        <YAxis
          domain={[0, maxValue || 20]}
          tickCount={6}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: "#888" }}
          tickLine={{ stroke: "#888" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "6px",
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="ideal"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
          name="Ideal Progress"
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="#4ade80"
          strokeWidth={2}
          activeDot={{ r: 6 }}
          name="Actual Progress"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  if (!showCard) {
    return chartContent;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Sprint Burnup</CardTitle>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
};

export default BurnupChart;
