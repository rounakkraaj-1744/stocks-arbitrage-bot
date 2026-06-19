import { SimpleLinearRegression } from 'ml-regression';

export function predictNextSpread(historicalSpreads: number[]): { prediction: number, trend: string } {
  if (historicalSpreads.length < 5) {
    return { prediction: historicalSpreads[historicalSpreads.length - 1] || 0, trend: 'Neutral' };
  }

  const x = Array.from({ length: historicalSpreads.length }, (_, i) => i);
  const y = historicalSpreads;

  const regression = new SimpleLinearRegression(x, y);

  const nextX = historicalSpreads.length;
  const prediction = regression.predict(nextX);
  
  const slope = regression.slope;
  let trend = 'Neutral';
  if (slope > 0.01)
    trend = 'Widening';
  if (slope < -0.01)
    trend = 'Narrowing';

  return { prediction, trend };
}