
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { predictHousingPrice, trainHousingModel } from '@/utils/tensorflowUtils';
import Layout from '@/components/layout/Layout';
import { Container } from '@/components/ui/container';

const TensorflowDemo = () => {
  const [modelStatus, setModelStatus] = useState('idle'); // idle, training, trained, predicting
  const [prediction, setPrediction] = useState(null);
  const [trainLoss, setTrainLoss] = useState([]);
  const [epoch, setEpoch] = useState(0);
  const [formValues, setFormValues] = useState({
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1500,
    floors: 1,
    waterfront: 0,
    condition: 3
  });
  const { toast } = useToast();
  const canvasRef = useRef(null);

  // Train model
  const handleTrain = async () => {
    try {
      setModelStatus('training');
      setTrainLoss([]);
      setEpoch(0);
      
      const onEpochEnd = (epoch, logs) => {
        setEpoch(epoch + 1);
        setTrainLoss(prevLoss => [...prevLoss, logs.loss]);
      };
      
      await trainHousingModel(onEpochEnd);
      
      setModelStatus('trained');
      toast({
        title: "Model Trained",
        description: "TensorFlow model has been successfully trained",
      });
    } catch (error) {
      console.error("Error training model:", error);
      setModelStatus('idle');
      toast({
        title: "Training Error",
        description: "Failed to train the model. See console for details.",
        variant: "destructive"
      });
    }
  };

  // Make prediction
  const handlePredict = async () => {
    try {
      setModelStatus('predicting');
      
      const result = await predictHousingPrice({
        bedrooms: parseInt(formValues.bedrooms),
        bathrooms: parseFloat(formValues.bathrooms),
        sqft: parseInt(formValues.sqft),
        floors: parseFloat(formValues.floors),
        waterfront: parseInt(formValues.waterfront),
        condition: parseInt(formValues.condition)
      });
      
      setPrediction(result);
      setModelStatus('trained');
      toast({
        title: "Prediction Complete",
        description: `Estimated price: $${result.toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error predicting:", error);
      setModelStatus('trained');
      toast({
        title: "Prediction Error",
        description: "Failed to generate prediction. Train the model first.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Draw loss chart
  useEffect(() => {
    if (trainLoss.length === 0 || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.moveTo(40, 20);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();
    
    // Draw loss curve
    if (trainLoss.length > 1) {
      const maxLoss = Math.max(...trainLoss);
      const minLoss = Math.min(...trainLoss);
      const range = maxLoss - minLoss;
      
      const xStep = (width - 60) / (trainLoss.length - 1);
      const getY = (loss) => {
        return height - 30 - ((loss - minLoss) / (range || 1)) * (height - 50);
      };
      
      ctx.beginPath();
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      ctx.moveTo(40, getY(trainLoss[0]));
      
      for (let i = 1; i < trainLoss.length; i++) {
        ctx.lineTo(40 + i * xStep, getY(trainLoss[i]));
      }
      
      ctx.stroke();
      
      // Draw labels
      ctx.fillStyle = '#888';
      ctx.font = '10px sans-serif';
      ctx.fillText('Loss', 10, height / 2);
      ctx.fillText('Epoch', width / 2, height - 10);
      
      ctx.fillStyle = '#666';
      ctx.font = '9px sans-serif';
      ctx.fillText(`${minLoss.toFixed(4)}`, 10, height - 30);
      ctx.fillText(`${maxLoss.toFixed(4)}`, 10, 20);
      ctx.fillText('0', 40, height - 20);
      ctx.fillText(`${trainLoss.length}`, width - 20, height - 20);
    }
  }, [trainLoss]);

  return (
    <Layout>
      <Container>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TensorFlow.js Housing Price Predictor</CardTitle>
              <CardDescription>
                This demo uses TensorFlow.js to train a model that predicts housing prices
                based on various features.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Bedrooms</h3>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[formValues.bedrooms]} 
                      min={1} 
                      max={6} 
                      step={1}
                      onValueChange={(value) => handleInputChange('bedrooms', value[0])} 
                    />
                    <span className="w-8 text-center">{formValues.bedrooms}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Bathrooms</h3>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[formValues.bathrooms]} 
                      min={1} 
                      max={4} 
                      step={0.5}
                      onValueChange={(value) => handleInputChange('bathrooms', value[0])} 
                    />
                    <span className="w-8 text-center">{formValues.bathrooms}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Square Feet</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      value={formValues.sqft}
                      onChange={(e) => handleInputChange('sqft', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Floors</h3>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[formValues.floors]} 
                      min={1} 
                      max={3} 
                      step={0.5}
                      onValueChange={(value) => handleInputChange('floors', value[0])} 
                    />
                    <span className="w-8 text-center">{formValues.floors}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Waterfront</h3>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[formValues.waterfront]} 
                      min={0} 
                      max={1} 
                      step={1}
                      onValueChange={(value) => handleInputChange('waterfront', value[0])} 
                    />
                    <span className="w-8 text-center">{formValues.waterfront ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Condition (1-5)</h3>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[formValues.condition]} 
                      min={1} 
                      max={5} 
                      step={1}
                      onValueChange={(value) => handleInputChange('condition', value[0])} 
                    />
                    <span className="w-8 text-center">{formValues.condition}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-40 border rounded-lg p-2 flex items-center justify-center">
                  {trainLoss.length > 0 ? (
                    <canvas ref={canvasRef} width="300" height="150" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Train the model to see the loss graph
                    </div>
                  )}
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="space-y-1">
                    <h3 className="font-medium">Training Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {modelStatus === 'idle' && 'Ready to train'}
                      {modelStatus === 'training' && `Training in progress (Epoch: ${epoch})`}
                      {modelStatus === 'trained' && 'Model trained successfully'}
                      {modelStatus === 'predicting' && 'Generating prediction...'}
                    </p>
                  </div>
                  
                  {prediction !== null && (
                    <div className="mt-4 p-3 bg-card rounded-md border">
                      <h4 className="text-sm font-medium">Predicted House Price</h4>
                      <p className="text-2xl font-bold text-agile-primary">
                        ${prediction.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleTrain}
                disabled={modelStatus === 'training' || modelStatus === 'predicting'}
              >
                {modelStatus === 'training' ? 'Training...' : 'Train Model'}
              </Button>
              <Button
                onClick={handlePredict}
                disabled={modelStatus !== 'trained' || modelStatus === 'predicting'}
              >
                Predict Price
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                This demo uses TensorFlow.js to build and train a neural network directly in your browser.
                The model is trained on housing dataset to predict housing prices based on features
                like number of bedrooms, bathrooms, square footage, etc.
              </p>
              <p>
                The model architecture consists of several dense layers with ReLU activation and is optimized using
                the Adam optimizer and mean squared error loss function.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Layout>
  );
};

export default TensorflowDemo;
