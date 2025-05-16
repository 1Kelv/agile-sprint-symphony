
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSprintPrediction } from '@/hooks/useSprintPrediction';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, TrendingUp, Award, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const SprintInsights = ({ sprints = [], tasks = [] }) => {
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  const { 
    estimatedVelocity, 
    predictedCompletionDate, 
    riskLevel, 
    recommendedCapacity,
    predictSprintSuccess,
    isPredicting,
    predictionScore,
    modelTrained,
    trainModelOnHistoricalData
  } = useSprintPrediction(sprints, tasks);

  const [isTraining, setIsTraining] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  
  // Get active sprint from props
  const activeSprint = sprints.find(sprint => sprint.status === 'active');
  
  // Run prediction on active sprint when AI is enabled
  useEffect(() => {
    if (aiEnabled && activeSprint && !isPredicting) {
      // Calculate days remaining
      const today = new Date();
      const endDate = new Date(activeSprint.end_date);
      const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
      
      // Run prediction
      predictSprintSuccess({
        progress: activeSprint.progress || 0,
        daysRemaining,
        tasksCompleted: activeSprint.tasks_completed || 0,
        tasksRemaining: (activeSprint.tasks_total || 0) - (activeSprint.tasks_completed || 0),
        teamSize: 5, // Placeholder, would ideally come from team data
        complexity: 3 // Medium complexity (1-5 scale)
      });
    }
  }, [aiEnabled, activeSprint, isPredicting, predictSprintSuccess]);

  // Get risk badge color
  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Handle model training
  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      await trainModelOnHistoricalData();
      setAiEnabled(true);
    } catch (error) {
      console.error("Error training model:", error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <span>Sprint Insights & Predictions</span>
          {aiEnabled && (
            <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Team Velocity */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Team Velocity:</span>
            </div>
            <span className="text-sm">{estimatedVelocity} story points per sprint</span>
          </div>

          {/* Recommended Capacity */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Recommended Capacity:</span>
            </div>
            <span className="text-sm">{recommendedCapacity} story points</span>
          </div>

          {/* Risk Assessment */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Sprint Risk Level:</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${getRiskBadgeColor(riskLevel)}`}
            >
              {riskLevel}
            </Badge>
          </div>

          {/* Predicted Completion */}
          {activeSprint && predictedCompletionDate && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Predicted Completion:</span>
              </div>
              <span className="text-sm">
                {format(predictedCompletionDate, 'MMM d, yyyy')}
                {new Date(activeSprint.end_date) < predictedCompletionDate && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  >
                    Delayed
                  </Badge>
                )}
              </span>
            </div>
          )}

          {/* TensorFlow Prediction */}
          {aiEnabled && (
            <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium">TensorFlow Prediction</span>
                </div>
                {isPredicting && (
                  <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
                )}
              </div>
              
              {isPredicting ? (
                <div className="space-y-2">
                  <div className="text-xs text-center text-muted-foreground">Analyzing sprint data...</div>
                  <Progress value={45} className="h-1" />
                </div>
              ) : (
                predictionScore !== null && (
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                      {Math.round(predictionScore * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Likelihood of sprint completion
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Toggle Advanced Metrics Button */}
          {showAdvancedMetrics && (
            <div className="space-y-3 mt-2 p-3 bg-muted/50 rounded-md">
              <div className="text-sm font-medium">Advanced Metrics</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-background rounded border">
                  <div className="text-xs text-muted-foreground">Velocity Trend</div>
                  <div className="text-sm font-medium">{riskLevel === 'Low' ? 'Increasing' : riskLevel === 'High' ? 'Decreasing' : 'Stable'}</div>
                </div>
                
                <div className="text-center p-2 bg-background rounded border">
                  <div className="text-xs text-muted-foreground">Story Points</div>
                  <div className="text-sm font-medium">{activeSprint?.story_points || 0}</div>
                </div>
                
                <div className="text-center p-2 bg-background rounded border">
                  <div className="text-xs text-muted-foreground">Burndown Index</div>
                  <div className="text-sm font-medium">{Math.round((predictionScore || 0.75) * 100 - 15)}</div>
                </div>
                
                <div className="text-center p-2 bg-background rounded border">
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                  <div className="text-sm font-medium">{Math.round((recommendedCapacity / (estimatedVelocity || 1)) * 100)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* AI/TensorFlow Button */}
          {!aiEnabled ? (
            <Button 
              variant="outline" 
              className="w-full mt-2 flex items-center justify-center"
              onClick={handleTrainModel}
              disabled={isTraining}
            >
              <Brain className="h-4 w-4 mr-2" />
              {isTraining ? "Training TensorFlow Model..." : "Enable TensorFlow Predictions"}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            >
              {showAdvancedMetrics ? "Hide Advanced Metrics" : "Show Advanced Metrics"}
            </Button>
          )}

          {/* Guidance Message */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
            {recommendedCapacity > 0 ? (
              <p>
                Based on your team's historical performance, we recommend planning for {recommendedCapacity} story points in your next sprint. 
                {riskLevel === 'High' && " Your velocity is trending downward, consider addressing team impediments."}
                {riskLevel === 'Medium' && " Your velocity has slightly decreased, monitor team progress closely."}
                {riskLevel === 'Low' && " Your team is maintaining consistent performance."}
              </p>
            ) : (
              <p>Complete at least one sprint to see intelligent predictions based on your team's performance.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SprintInsights;
