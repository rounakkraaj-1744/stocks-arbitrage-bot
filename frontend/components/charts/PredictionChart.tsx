"use client";

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { ChartDataPoint, PredictionResult } from '@/lib/types';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PredictionChartProps {
    historicalData: ChartDataPoint[];
    predictions: PredictionResult[];
    height?: number;
}

export function PredictionChart({ historicalData, predictions, height = 400 }: PredictionChartProps) {
    const historicalSeries = {
        name: 'Historical Spread',
        type: 'line',
        data: historicalData.map(d => ({ x: d.timestamp, y: d.spread })),
    };

    const predictionSeries = {
        name: 'Predicted Spread',
        type: 'line',
        data: predictions.map(p => ({ x: p.timestamp, y: p.predictedSpread })),
    };

    const upperBoundSeries = {
        name: 'Upper Bound',
        type: 'line',
        data: predictions.map(p => ({ x: p.timestamp, y: p.upperBound })),
    };

    const lowerBoundSeries = {
        name: 'Lower Bound',
        type: 'line',
        data: predictions.map(p => ({ x: p.timestamp, y: p.lowerBound })),
    };

    const options: ApexOptions = {
        chart: {
            type: 'line',
            height,
            zoom: { enabled: true },
            toolbar: { show: true },
            background: 'transparent',
        },
        colors: ['#60a5fa', '#f97316', '#22c55e', '#ef4444'],
        stroke: {
            width: [3, 2, 1, 1],
            dashArray: [0, 5, 3, 3],
            curve: 'smooth',
        },
        fill: {
            opacity: [1, 0.8, 0.3, 0.3],
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: '#64748b' },
                datetimeFormatter: {
                    hour: 'HH:mm',
                    minute: 'HH:mm',
                },
            },
        },
        yaxis: {
            title: { text: 'Spread %', style: { color: '#64748b' } },
            labels: {
                style: { colors: ['#64748b'] },
                formatter: (val) => `${val.toFixed(2)}%`,
            },
        },
        legend: {
            position: 'top',
            labels: { colors: '#64748b' },
        },
        grid: {
            borderColor: '#334155',
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            x: {
                format: 'dd MMM HH:mm',
            },
        },
        annotations: {
            xaxis: [{
                x: historicalData[historicalData.length - 1]?.timestamp || Date.now(),
                borderColor: '#fb923c',
                label: {
                    style: { color: '#fff', background: '#fb923c' },
                    text: 'Prediction Start',
                },
            }],
        },
    };

    return (
        <ApexCharts
            options={options}
            series={[historicalSeries, predictionSeries, upperBoundSeries, lowerBoundSeries]}
            type="line"
            height={height}
        />
    );
}
