
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Info } from 'lucide-react';

const BurndownChart = ({ sprint, tasks = [] }) => {
  const generateBurndownData = () => {
    if (!sprint) return [];
    
    // Get sprint duration in days
    const startDate = new Date(sprint.startDate || sprint.start_date);
    const endDate = new Date(sprint.endDate || sprint.end_date);
    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate total story points
    const totalPoints = tasks
      .filter(task => task.sprint_id === sprint.id)
      .reduce((sum, task) => sum + (task.story_points || 0), 0);
    
    // Generate ideal burndown line
    const idealBurndown = [];
    for (let day = 0; day < durationDays; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      
      idealBurndown.push({
        day: day + 1,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ideal: Math.round(totalPoints * (1 - day / (durationDays - 1))),
      });
    }
    
    // For the demo, generate some actual data with randomness
    const today = new Date();
    let remaining = totalPoints;
    const actual = idealBurndown.map(day => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + day.day - 1);
      
      // Only add actual data for days that have passed
      if (dayDate <= today) {
        // Add some variability around the ideal line
        const dailyChange = Math.floor(totalPoints / (durationDays - 1) * (0.5 + Math.random()));
        remaining = Math.max(0, remaining - dailyChange);
      }
      
      return {
        ...day,
        actual: dayDate <= today ? remaining : null
      };
    });
    
    return actual;
  };
  
  const data = generateBurndownData();
  
  // If no data or no sprint, show a placeholder
  if (!sprint || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sprint Burndown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <p className="text-muted-foreground">
              {!sprint ? "Select a sprint to view burndown chart" : "No data available for this sprint"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sprint Burndown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#8884d8"
                strokeDasharray="5 5"
                name="Ideal Burndown"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#82ca9d"
                name="Actual Remaining"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-500 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            The burndown chart shows the rate at which work is completed and how much work remains. The ideal line represents a steady pace, while the actual line shows your team's progress. If the actual line is above the ideal, you're behind schedule.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BurndownChart;
