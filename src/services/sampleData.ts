/* ──────────────────────────────────────────
   LearnArena — Sample / Demo Data
   ────────────────────────────────────────── */

import { DashboardData } from '../types';

export function generateSampleDashboard(): DashboardData {
  return {
    moduleTitle: 'Introduction to Machine Learning',
    moduleEmoji: '🤖',
    globalDifficulty: 'intermediate',
    synthesis: {
      summary: 'Machine Learning is a subset of AI that enables systems to learn from data without explicit programming. This module covers supervised, unsupervised, and reinforcement learning paradigms.',
      keyTakeaways: [
        'Supervised learning uses labeled data to train models',
        'Unsupervised learning finds patterns in unlabeled data',
        'Reinforcement learning learns through trial and error with reward signals',
        'Feature engineering is crucial for model performance',
        'Overfitting occurs when models memorize training data instead of generalizing',
      ],
      recommendedNext: [
        'Deep Learning Fundamentals',
        'Neural Network Architectures',
        'ML Model Evaluation Metrics',
      ],
    },
    contextGraph: [
      {
        id: 'root',
        label: 'Machine Learning',
        emoji: '🤖',
        children: [
          {
            id: 'supervised',
            label: 'Supervised Learning',
            emoji: '📊',
            children: [
              { id: 'classification', label: 'Classification', emoji: '🏷️' },
              { id: 'regression', label: 'Regression', emoji: '📈' },
            ],
          },
          {
            id: 'unsupervised',
            label: 'Unsupervised Learning',
            emoji: '🔍',
            children: [
              { id: 'clustering', label: 'Clustering', emoji: '🫧' },
              { id: 'dim-reduction', label: 'Dim. Reduction', emoji: '📉' },
            ],
          },
          {
            id: 'reinforcement',
            label: 'Reinforcement',
            emoji: '🎮',
            children: [
              { id: 'q-learning', label: 'Q-Learning', emoji: '🧮' },
              { id: 'policy', label: 'Policy Gradients', emoji: '🎯' },
            ],
          },
        ],
      },
    ],
    coreConcepts: [
      { id: 'cc-1', term: 'Supervised Learning', emoji: '📊', definition: 'Training models on labeled data where input-output pairs are known, allowing the model to learn the mapping function.', difficulty: 'easy' },
      { id: 'cc-2', term: 'Unsupervised Learning', emoji: '🔍', definition: 'Finding hidden patterns or structures in unlabeled data without predefined outputs.', difficulty: 'medium' },
      { id: 'cc-3', term: 'Overfitting', emoji: '⚠️', definition: 'When a model learns training data too well, including noise, resulting in poor generalization to new data.', difficulty: 'medium' },
      { id: 'cc-4', term: 'Feature Engineering', emoji: '🔧', definition: 'The process of selecting, transforming, and creating relevant features from raw data to improve model performance.', difficulty: 'hard' },
      { id: 'cc-5', term: 'Cross-Validation', emoji: '🔄', definition: 'A technique for assessing model performance by splitting data into training and validation sets multiple times.', difficulty: 'medium' },
      { id: 'cc-6', term: 'Gradient Descent', emoji: '⛰️', definition: 'An optimization algorithm that iteratively adjusts model parameters to minimize the loss function.', difficulty: 'hard' },
    ],
    quiz: [
      {
        id: 'q-1',
        question: 'Which type of learning uses labeled data?',
        options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
        correctIndex: 1,
        explanation: 'Supervised learning requires labeled input-output pairs to train the model.',
        difficulty: 'easy',
        conceptId: 'cc-1',
      },
      {
        id: 'q-2',
        question: 'What problem occurs when a model performs well on training data but poorly on new data?',
        options: ['Underfitting', 'Overfitting', 'Regularization', 'Normalization'],
        correctIndex: 1,
        explanation: 'Overfitting means the model memorized training data patterns instead of learning generalizable rules.',
        difficulty: 'medium',
        conceptId: 'cc-3',
      },
      {
        id: 'q-3',
        question: 'What is the primary goal of cross-validation?',
        options: ['Increase training speed', 'Reduce model size', 'Estimate generalization performance', 'Create more training data'],
        correctIndex: 2,
        explanation: 'Cross-validation helps estimate how well a model will perform on unseen data by testing across multiple splits.',
        difficulty: 'medium',
        conceptId: 'cc-5',
      },
      {
        id: 'q-4',
        question: 'Gradient descent adjusts parameters to:',
        options: ['Maximize the loss function', 'Minimize the loss function', 'Increase model complexity', 'Reduce feature count'],
        correctIndex: 1,
        explanation: 'Gradient descent moves parameters in the direction that minimizes the loss function.',
        difficulty: 'hard',
        conceptId: 'cc-6',
      },
      {
        id: 'q-5',
        question: 'Which is NOT an example of unsupervised learning?',
        options: ['K-means clustering', 'PCA dimensionality reduction', 'Linear regression with labels', 'DBSCAN'],
        correctIndex: 2,
        explanation: 'Linear regression with labels is supervised learning because it uses labeled output values.',
        difficulty: 'medium',
      },
    ],
    recallCards: [
      { id: 'rc-1', front: 'What is the difference between supervised and unsupervised learning?', back: 'Supervised uses labeled data with known outputs. Unsupervised finds patterns in unlabeled data.', emoji: '📊', difficulty: 'easy', known: null },
      { id: 'rc-2', front: 'What is overfitting and how can you prevent it?', back: 'Overfitting is when a model memorizes training data. Prevent with regularization, cross-validation, and more training data.', emoji: '⚠️', difficulty: 'medium', known: null },
      { id: 'rc-3', front: 'Describe the gradient descent algorithm.', back: 'An iterative optimization algorithm that computes the gradient of the loss function and moves parameters in the opposite direction to find the minimum.', emoji: '⛰️', difficulty: 'hard', known: null },
      { id: 'rc-4', front: 'What is feature engineering?', back: 'The process of creating, selecting, and transforming features from raw data to improve model accuracy and performance.', emoji: '🔧', difficulty: 'medium', known: null },
    ],
  };
}

export const SAMPLE_TEXT = `# Introduction to Machine Learning

Machine Learning (ML) is a branch of artificial intelligence that focuses on building systems that learn from data.

## Types of Machine Learning

### Supervised Learning
- Uses labeled training data
- Input features mapped to known outputs
- Examples: classification (spam detection), regression (price prediction)
- Common algorithms: Linear Regression, Decision Trees, SVM, Neural Networks

### Unsupervised Learning
- Finds patterns in unlabeled data
- No predefined outputs or labels
- Examples: customer segmentation, anomaly detection
- Common algorithms: K-Means, DBSCAN, PCA, Autoencoders

### Reinforcement Learning
- Agent learns through interaction with environment
- Receives rewards or penalties for actions
- Goal: maximize cumulative reward
- Examples: game playing (AlphaGo), robotics, recommendation systems

## Key Concepts

### Overfitting vs Underfitting
- Overfitting: Model too complex, memorizes training data, poor generalization
- Underfitting: Model too simple, fails to capture patterns
- Solution: Cross-validation, regularization, proper model selection

### Feature Engineering
- Creating meaningful features from raw data
- Includes: scaling, encoding, transformation, selection
- Critical for model performance

### Model Evaluation
- Train/Test split
- Cross-validation (k-fold)
- Metrics: accuracy, precision, recall, F1-score, RMSE

### Gradient Descent
- Optimization algorithm for minimizing loss
- Computes gradient of loss w.r.t. parameters
- Updates parameters in opposite direction of gradient
- Variants: Batch, Stochastic, Mini-batch`;
