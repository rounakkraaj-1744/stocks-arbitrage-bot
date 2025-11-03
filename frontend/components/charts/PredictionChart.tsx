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
        type: 'line' as const,
        data: historicalData.map(d => ({ x: d.timestamp, y: d.spread })),
    };

    const predictionSeries = {
        name: 'Predicted Spread',
        type: 'line' as const,
        data: predictions.map(p => ({ x: p.timestamp, y: p.predictedSpread })),
    };

    const upperBoundSeries = {
        name: 'Upper Confidence (95%)',
        type: 'line' as const,
        data: predictions.map(p => ({ x: p.timestamp, y: p.upperBound })),
    };

    const lowerBoundSeries = {
        name: 'Lower Confidence (95%)',
        type: 'line' as const,
        data: predictions.map(p => ({ x: p.timestamp, y: p.lowerBound })),
    };

    const options: ApexOptions = {
        chart: {
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                },
            },
        },
        colors: ['#60a5fa', '#f97316', '#22c55e', '#ef4444'],
        stroke: {
            width: [3, 3, 2, 2],
            dashArray: [0, 5, 3, 3],
            curve: 'smooth',
        },
        fill: {
            opacity: [1, 0.9, 0.4, 0.4],
            type: ['solid', 'solid', 'gradient', 'gradient'],
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                opacityFrom: 0.4,
                opacityTo: 0.1,
            },
        },
        markers: {
            size: [4, 4, 0, 0],
            strokeWidth: 2,
            hover: {
                size: 7,
            },
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 500,
                },
                datetimeFormatter: {
                    year: 'yyyy',
                    month: "MMM 'yy",
                    day: 'dd MMM',
                    hour: 'HH:mm',
                    minute: 'HH:mm',
                },
            },
            axisBorder: {
                show: true,
                color: '#334155',
            },
            axisTicks: {
                show: true,
                color: '#334155',
            },
        },
        yaxis: {
            title: {
                text: 'Spread Percentage',
                style: {
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 600,
                }
            },
            labels: {
                style: {
                    colors: ['#94a3b8'],
                    fontSize: '11px',
                },
                formatter: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    return `${val.toFixed(2)}%`;
                },
            },
            forceNiceScale: true,
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center',
            labels: {
                colors: '#94a3b8',
                useSeriesColors: false,
            },
            markers: {
                strokeWidth: 0
            },
            itemMargin: {
                horizontal: 12,
                vertical: 8,
            },
            fontSize: '12px',
            fontWeight: 500,
        },
        grid: {
            borderColor: '#1e293b',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 10,
                bottom: 0,
                left: 10,
            },
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            intersect: false,
            x: {
                format: 'dd MMM HH:mm',
            },
            y: {
                formatter: (val) => {
                    if (val == null || isNaN(val)) return 'N/A';
                    return `${val.toFixed(3)}%`;
                },
            },
            style: {
                fontSize: '12px',
            },
            marker: {
                show: true,
            },
        },
        annotations: {
            xaxis: [
                {
                    x: historicalData[historicalData.length - 1]?.timestamp || Date.now(),
                    borderColor: '#f97316',
                    strokeDashArray: 5,
                    label: {
                        borderColor: '#f97316',
                        style: {
                            color: '#fff',
                            background: '#f97316',
                            fontSize: '11px',
                            fontWeight: 600,
                        },
                        text: '🔮 Prediction Start',
                        orientation: 'horizontal',
                        offsetY: -10,
                    },
                },
            ],
            points: historicalData.length > 0 ? [
                {
                    x: historicalData[historicalData.length - 1]?.timestamp || Date.now(),
                    y: historicalData[historicalData.length - 1]?.spread || 0,
                    marker: {
                        size: 8,
                        fillColor: '#f97316',
                        strokeColor: '#fff',
                        strokeWidth: 3,
                        shape: 'circle',
                    },
                    label: {
                        text: 'Now',
                        style: {
                            background: '#f97316',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 600,
                        },
                    },
                },
            ] : [],
        },
    };

    return (
        <div className="relative">
            <div className="absolute top-0 right-0 z-10 flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-400"></div>
                    <span className="text-xs text-slate-300 font-medium">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-orange-400 opacity-80" style={{ borderTop: '2px dashed' }}></div>
                    <span className="text-xs text-slate-300 font-medium">Forecast</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-400 opacity-50"></div>
                    <span className="text-xs text-slate-300 font-medium">95% CI</span>
                </div>
            </div>

            <ApexCharts
                options={options}
                series={[historicalSeries, predictionSeries, upperBoundSeries, lowerBoundSeries]}
                type="line"
                height={height}
            />

            <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                        <span>
                            <span className="text-slate-500">Historical:</span>
                            <span className="ml-1 text-blue-400 font-semibold">{historicalData.length} points</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>
                            <span className="text-slate-500">Predictions:</span>
                            <span className="ml-1 text-orange-400 font-semibold">{predictions.length} steps</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>
                            <span className="text-slate-500">Confidence:</span>
                            <span className="ml-1 text-green-400 font-semibold">
                                {predictions.length > 0 ? `${predictions[0].confidence.toFixed(0)}%` : 'N/A'}
                            </span>
                        </span>
                    </div>
                    <div className="text-slate-500 italic">
                        Orange dashed line indicates future predictions
                    </div>
                </div>
            </div>
        </div>
    );
}