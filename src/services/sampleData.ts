import { DashboardData } from '../types';

export function generateSampleDashboard(): DashboardData {
  return {
    moduleTitle: 'Introduction to Machine Learning',
    moduleEmoji: '🤖',
    globalDifficulty: 'intermediate',
    synthesis: {
      summary:
        'Machine Learning (ML) is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. At its core, ML uses algorithms to identify patterns in data and make decisions with minimal human intervention. The field is broadly divided into supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error). Key concepts include features, labels, training/testing splits, and model evaluation metrics. ML has transformed industries from healthcare diagnostics to autonomous vehicles, making it one of the most impactful technologies of our time.',
      audioTabs: [
        {
          title: 'Overview',
          content:
            'Welcome to Machine Learning — the engine behind today\'s smartest applications. In this module, we explore how computers learn from data rather than following hard-coded rules. You\'ll discover how algorithms like linear regression and decision trees find patterns in information, and how these models improve with more data. Think of it like teaching a child to recognize animals: you show them examples, correct mistakes, and over time they learn to identify new ones on their own.',
        },
        {
          title: 'Deep Dive',
          content:
            'Machine learning operations are built on three pillars: data preparation, model training, and evaluation. Data must be cleaned, normalized, and split into training and test sets. During training, algorithms adjust internal parameters to minimize prediction error. Evaluation metrics like accuracy, precision, recall, and F1-score tell us how well the model performs. Overfitting — when a model memorizes training data but fails on new data — is a key challenge addressed through techniques like cross-validation and regularization.',
        },
        {
          title: 'Key Takeaways',
          content:
            'Machine learning learns patterns from data — not from explicit rules. The three main paradigms are supervised, unsupervised, and reinforcement learning. A model\'s true test is how it performs on unseen data, not its training accuracy. Feature engineering and data quality matter more than the choice of algorithm. Always split your data into training, validation, and test sets.',
        },
      ],
    },
    coreConcepts: [
      { id: 'cc-1', term: 'Supervised Learning', definition: 'Learning from labeled training data where the correct output is provided for each example.', emoji: '📋', difficulty: 'easy' },
      { id: 'cc-2', term: 'Unsupervised Learning', definition: 'Finding hidden patterns or groupings in unlabeled data without predefined categories.', emoji: '🔍', difficulty: 'easy' },
      { id: 'cc-3', term: 'Feature Engineering', definition: 'The process of selecting and transforming raw data into meaningful attributes that improve model performance.', emoji: '⚙️', difficulty: 'medium' },
      { id: 'cc-4', term: 'Overfitting', definition: 'When a model learns the training data too well, including noise, and performs poorly on new, unseen data.', emoji: '⚠️', difficulty: 'medium' },
      { id: 'cc-5', term: 'Cross-Validation', definition: 'A technique where data is split multiple times into training/validation sets to assess model generalization.', emoji: '🔄', difficulty: 'medium' },
      { id: 'cc-6', term: 'Gradient Descent', definition: 'An optimization algorithm that iteratively adjusts model parameters to minimize prediction error.', emoji: '📉', difficulty: 'hard' },
      { id: 'cc-7', term: 'Bias-Variance Tradeoff', definition: 'The balance between underfitting (bias) and overfitting (variance) that determines a model\'s generalization ability.', emoji: '⚖️', difficulty: 'hard' },
      { id: 'cc-8', term: 'Reinforcement Learning', definition: 'A paradigm where an agent learns optimal actions through trial-and-error interactions with an environment.', emoji: '🎮', difficulty: 'hard' },
      { id: 'cc-9', term: 'Confusion Matrix', definition: 'A table that summarizes classification performance by comparing predicted vs actual labels.', emoji: '📊', difficulty: 'medium' },
      { id: 'cc-10', term: 'Transfer Learning', definition: 'Leveraging knowledge from a pre-trained model on one task to improve learning on a related task.', emoji: '🧠', difficulty: 'hard' },
    ],
    contextGraph: [
      { id: 'node-1', label: 'Data Preparation', description: 'Cleaning, normalizing, and splitting raw data before training', group: 0, connections: ['node-2', 'node-3'] },
      { id: 'node-2', label: 'Supervised Learning', description: 'Learning from labeled examples to predict outcomes', group: 1, connections: ['node-4', 'node-6'] },
      { id: 'node-3', label: 'Unsupervised Learning', description: 'Discovering patterns in unlabeled data', group: 1, connections: ['node-4'] },
      { id: 'node-4', label: 'Model Training', description: 'The iterative process of fitting a model to training data', group: 2, connections: ['node-5', 'node-7'] },
      { id: 'node-5', label: 'Evaluation', description: 'Measuring model performance using accuracy, precision, recall, etc.', group: 3, connections: ['node-6'] },
      { id: 'node-6', label: 'Overfitting', description: 'When a model captures noise instead of signal', group: 3, connections: ['node-7', 'node-8'] },
      { id: 'node-7', label: 'Regularization', description: 'Techniques to prevent overfitting by penalizing complexity', group: 2, connections: ['node-8'] },
      { id: 'node-8', label: 'Deployment', description: 'Putting a trained model into production for real-world use', group: 4, connections: [] },
    ],
    scenarios: [
      {
        id: 'sc-1',
        title: 'Spam Detection',
        description: 'Design a system that automatically identifies spam emails from legitimate ones. What type of ML would you use? What features matter?',
        difficulty: 'beginner',
        exampleResponse: 'Use supervised learning with labeled emails (spam/ham). Key features include sender reputation, keyword frequency, and link patterns. Train a classifier like Naive Bayes or Random Forest on historical email data.',
      },
      {
        id: 'sc-2',
        title: 'Customer Segmentation',
        description: 'An e-commerce company wants to group customers by purchasing behavior to target marketing campaigns. How would you approach this?',
        difficulty: 'intermediate',
        exampleResponse: 'Use unsupervised learning — K-means clustering on purchase frequency, average order value, and product categories. Start with 3-5 clusters and refine based on business interpretability.',
      },
      {
        id: 'sc-3',
        title: 'Autonomous Driving Perception',
        description: 'A self-driving car needs to identify pedestrians, vehicles, and road signs in real-time camera feeds. What ML approach works best?',
        difficulty: 'advanced',
        exampleResponse: 'Use deep learning — specifically convolutional neural networks (CNNs) for object detection. Models like YOLO or SSD enable real-time inference. Transfer learning from ImageNet pre-trained models accelerates development.',
      },
      {
        id: 'sc-4',
        title: 'Predictive Maintenance',
        description: 'A factory wants to predict equipment failures before they happen to reduce downtime. Outline an ML solution.',
        difficulty: 'intermediate',
        exampleResponse: 'Use supervised learning with historical sensor data labeled with failure events. Features include temperature, vibration, and runtime. Anomaly detection flags unusual patterns. Imbalanced data is handled via SMOTE or weighted loss functions.',
      },
    ],
    quiz: [
      { id: 'q-1', question: 'Which type of ML uses labeled training data?', options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Transfer learning'], correctIndex: 1, explanation: 'Supervised learning uses labeled data where each training example has a known correct output.', topic: 'Fundamentals' },
      { id: 'q-2', question: 'What is the main sign of overfitting?', options: ['High training accuracy but poor test accuracy', 'Low training accuracy', 'Slow training speed', 'Large dataset requirements'], correctIndex: 0, explanation: 'Overfitting means the model memorizes training data but fails to generalize to new data.', topic: 'Model Evaluation' },
      { id: 'q-3', question: 'What does cross-validation help assess?', options: ['Training speed', 'Model generalization', 'Data quality', 'Feature importance'], correctIndex: 1, explanation: 'Cross-validation tests how well a model generalizes by training on different data subsets.', topic: 'Model Evaluation' },
      { id: 'q-4', question: 'In gradient descent, what is being minimized?', options: ['Model size', 'Dataset size', 'Prediction error (loss)', 'Number of features'], correctIndex: 2, explanation: 'Gradient descent iteratively adjusts parameters to minimize the loss function (prediction error).', topic: 'Optimization' },
      { id: 'q-5', question: 'Which technique reuses a pre-trained model for a related task?', options: ['Reinforcement learning', 'Ensemble learning', 'Transfer learning', 'Active learning'], correctIndex: 2, explanation: 'Transfer learning adapts knowledge from one task to improve learning on a related task.', topic: 'Advanced Methods' },
      { id: 'q-6', question: 'What does a confusion matrix NOT directly show?', options: ['True positives', 'False positives', 'Training time', 'False negatives'], correctIndex: 2, explanation: 'A confusion matrix shows prediction outcomes (TP, FP, FN, TN) — not training time.', topic: 'Evaluation' },
      { id: 'q-7', question: 'Which ML paradigm learns through rewards and punishments?', options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Semi-supervised learning'], correctIndex: 2, explanation: 'Reinforcement learning uses rewards and penalties to train an agent through trial and error.', topic: 'Paradigms' },
      { id: 'q-8', question: 'The bias-variance tradeoff relates to:', options: ['Dataset size', 'Model complexity', 'Training speed', 'Feature count'], correctIndex: 1, explanation: 'Higher complexity increases variance (overfitting risk), lower complexity increases bias (underfitting).', topic: 'Fundamentals' },
      { id: 'q-9', question: 'What is feature engineering?', options: ['Writing code to train a model', 'Selecting/transforming raw data into useful features', 'Deploying models to production', 'Testing model accuracy'], correctIndex: 1, explanation: 'Feature engineering creates meaningful input attributes that help models learn patterns effectively.', topic: 'Data Preparation' },
      { id: 'q-10', question: 'Which scenario best suits unsupervised learning?', options: ['Spam detection', 'Customer segmentation', 'Price prediction', 'Image classification'], correctIndex: 1, explanation: 'Customer segmentation discovers groups in unlabeled customer data — a classic unsupervised task.', topic: 'Applications' },
    ],
    xpAwarded: 50,
  };
}