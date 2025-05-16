
import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow.js Utilities for AgileFlow
 * 
 * This file contains utilities for machine learning with TensorFlow.js.
 * While the current implementation focuses on housing price prediction,
 * the same approach can be extended to:
 * 
 * 1. Sprint Automation:
 *    - Predict optimal sprint capacity based on team velocity history
 *    - Recommend story point estimates based on similar past items
 *    - Suggest task assignments based on team member skills and workload
 * 
 * 2. Backlog Prioritization:
 *    - Identify high-value backlog items based on business impact metrics
 *    - Recommend optimal sequencing of backlog items
 * 
 * 3. Risk Prediction:
 *    - Identify sprints at risk of not meeting their goals
 *    - Predict potential bottlenecks in the development process
 */

// Define the housing dataset model
let housingModel;

// Normalize feature data to improve training
const normalizeFeature = (value, min, max) => {
  return (value - min) / (max - min);
};

// Denormalize prediction
const denormalizePrice = (value, min, max) => {
  return value * (max - min) + min;
};

// Train the housing price prediction model
export const trainHousingModel = async (onEpochEnd) => {
  // Set up feature normalization ranges based on Seattle housing data
  const ranges = {
    bedrooms: { min: 1, max: 6 },
    bathrooms: { min: 1, max: 4 },
    sqft: { min: 500, max: 3500 },
    floors: { min: 1, max: 3 },
    waterfront: { min: 0, max: 1 },
    condition: { min: 1, max: 5 }
  };
  
  // Price range for denormalization
  const priceRange = { min: 200000, max: 1200000 };
  
  // Generate synthetic training data
  const numSamples = 500;
  const trainingData = [];
  
  for (let i = 0; i < numSamples; i++) {
    const bedrooms = Math.floor(Math.random() * (ranges.bedrooms.max - ranges.bedrooms.min) + ranges.bedrooms.min);
    const bathrooms = Math.floor((Math.random() * (ranges.bathrooms.max - ranges.bathrooms.min) + ranges.bathrooms.min) * 2) / 2; // 0.5 increment
    const sqft = Math.floor(Math.random() * (ranges.sqft.max - ranges.sqft.min) + ranges.sqft.min);
    const floors = Math.floor((Math.random() * (ranges.floors.max - ranges.floors.min) + ranges.floors.min) * 2) / 2; // 0.5 increment
    const waterfront = Math.random() > 0.8 ? 1 : 0; // 20% chance of waterfront
    const condition = Math.floor(Math.random() * (ranges.condition.max - ranges.condition.min) + ranges.condition.min);
    
    // Generate price based on features with some randomness
    let price = 100000; // base price
    price += bedrooms * 50000;
    price += bathrooms * 40000;
    price += sqft * 200;
    price += floors * 30000;
    price += waterfront * 200000;
    price += condition * 30000;
    
    // Add some random noise
    price += (Math.random() - 0.5) * 100000;
    
    // Ensure price is within range
    price = Math.max(priceRange.min, Math.min(priceRange.max, price));
    
    trainingData.push({
      x: {
        bedrooms,
        bathrooms, 
        sqft,
        floors,
        waterfront,
        condition
      },
      y: price
    });
  }
  
  // Prepare tensors
  const xs = tf.tensor2d(trainingData.map(item => [
    normalizeFeature(item.x.bedrooms, ranges.bedrooms.min, ranges.bedrooms.max),
    normalizeFeature(item.x.bathrooms, ranges.bathrooms.min, ranges.bathrooms.max),
    normalizeFeature(item.x.sqft, ranges.sqft.min, ranges.sqft.max),
    normalizeFeature(item.x.floors, ranges.floors.min, ranges.floors.max),
    normalizeFeature(item.x.waterfront, ranges.waterfront.min, ranges.waterfront.max),
    normalizeFeature(item.x.condition, ranges.condition.min, ranges.condition.max)
  ]));
  
  const ys = tf.tensor2d(trainingData.map(item => [
    normalizeFeature(item.y, priceRange.min, priceRange.max)
  ]));
  
  // Create the model
  housingModel = tf.sequential();
  
  // Add layers
  housingModel.add(tf.layers.dense({
    inputShape: [6],
    units: 24,
    activation: 'relu'
  }));
  
  housingModel.add(tf.layers.dense({
    units: 12,
    activation: 'relu'
  }));
  
  housingModel.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid' // Output between 0-1 for normalized price
  }));
  
  // Compile the model
  housingModel.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'meanSquaredError'
  });
  
  // Train the model
  await housingModel.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onEpochEnd) onEpochEnd(epoch, logs);
      }
    }
  });
  
  // Store ranges for later prediction
  housingModel.ranges = ranges;
  housingModel.priceRange = priceRange;
  
  // Free up memory
  xs.dispose();
  ys.dispose();
  
  return housingModel;
};

// Predict housing price based on input features
export const predictHousingPrice = async (features) => {
  if (!housingModel) {
    throw new Error("Model not trained yet. Please train the model first.");
  }
  
  const { ranges, priceRange } = housingModel;
  
  // Normalize input features
  const normalizedFeatures = [
    normalizeFeature(features.bedrooms, ranges.bedrooms.min, ranges.bedrooms.max),
    normalizeFeature(features.bathrooms, ranges.bathrooms.min, ranges.bathrooms.max),
    normalizeFeature(features.sqft, ranges.sqft.min, ranges.sqft.max),
    normalizeFeature(features.floors, ranges.floors.min, ranges.floors.max),
    normalizeFeature(features.waterfront, ranges.waterfront.min, ranges.waterfront.max),
    normalizeFeature(features.condition, ranges.condition.min, ranges.condition.max)
  ];
  
  // Make prediction
  const inputTensor = tf.tensor2d([normalizedFeatures]);
  const prediction = housingModel.predict(inputTensor);
  const predictionValue = prediction.dataSync()[0];
  
  // Clean up
  inputTensor.dispose();
  prediction.dispose();
  
  // Denormalize to get actual price
  return Math.round(denormalizePrice(predictionValue, priceRange.min, priceRange.max));
};

/**
 * Future Sprint Automation Extensions
 * 
 * The following functions could be implemented to extend the ML capabilities to sprint automation:
 * 
 * 1. trainVelocityModel - Train a model to predict team velocity based on sprint history
 * 2. predictSprintCapacity - Predict optimal sprint capacity based on team composition
 * 3. estimateStoryPoints - Suggest story point estimates for backlog items
 * 4. recommendTaskAssignments - Suggest optimal task assignments based on skills and workload
 * 5. predictSprintRisks - Identify potential risks in current sprint plans
 */
