"use client";

import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { ChartDataPoint } from '@/lib/types';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SpreadChartProps {
  data: ChartDataPoint[];
  threshold: number;
  height?: number;
}

export function SpreadChart({ data, threshold, height = 400 }: SpreadChartProps) {
  const categories = data.map((point) => point.time);
  
  const series = [{
    name: "Spread Percentage",
    data: data.map((point) => point.spread),
  }];

  const options: ApexOptions = {
    chart: {
      type: "area",
      height,
      zoom: { 
        enabled: true, 
        type: "x",
        autoScaleYaxis: false,
      },
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: "transparent",
      animations: {
        enabled: false,
      },
    },
    stroke: { 
      width: 3, 
      curve: "smooth" 
    },
    colors: ["#fb923c"],
    fill: {
      type: "gradient",
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#f97316'],
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    dataLabels: { 
      enabled: false 
    },
    markers: { 
      size: 0,
      strokeWidth: 0,
      hover: { 
        sizeOffset: 7 
      } 
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: "dark",
      x: {
        show: true,
      },
      y: {
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(3)}%`;
        },
        title: {
          formatter: () => 'Spread:',
        },
      },
      style: {
        fontSize: '12px',
      },
      marker: {
        show: true,
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: { 
          colors: "#94a3b8", 
          fontSize: "11px",
          fontWeight: 500,
        },
        trim: true,
      },
      axisBorder: { 
        show: true, 
        color: "#334155" 
      },
      axisTicks: { 
        show: true, 
        color: "#334155" 
      },
    },
    yaxis: {
      title: { 
        text: "Spread Percentage", 
        style: { 
          color: "#94a3b8",
          fontSize: '12px',
          fontWeight: 600,
        } 
      },
      labels: {
        style: { 
          colors: ["#94a3b8"],
          fontSize: '11px',
          fontWeight: 500,
        },
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(2)}%`;
        },
      },
      forceNiceScale: true,
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: 'center',
      labels: { 
        colors: "#94a3b8",
        useSeriesColors: false,
      },
      markers: {
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 8,
      },
      fontSize: '12px',
      fontWeight: 500,
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 3,
      xaxis: { 
        lines: { 
          show: true 
        } 
      },
      yaxis: { 
        lines: { 
          show: true 
        } 
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    annotations: {
      yaxis: [
        {
          y: threshold,
          borderColor: "#10b981",
          strokeDashArray: 5,
          label: {
            borderColor: "#10b981",
            style: { 
              color: "#fff", 
              background: "#10b981",
              fontSize: '11px',
              fontWeight: 600,
            },
            text: `🟢 Buy Zone (>${threshold}%)`,
            position: 'left',
          },
        },
        {
          y: -threshold,
          borderColor: "#ef4444",
          strokeDashArray: 5,
          label: {
            borderColor: "#ef4444",
            style: { 
              color: "#fff", 
              background: "#ef4444",
              fontSize: '11px',
              fontWeight: 600,
            },
            text: `🔴 Sell Zone (<${-threshold}%)`,
            position: 'left',
          },
        },
        {
          y: 0,
          borderColor: "#64748b",
          strokeDashArray: 3,
          label: {
            borderColor: "#64748b",
            style: { 
              color: "#fff", 
              background: "#64748b",
              fontSize: '10px',
              fontWeight: 500,
            },
            text: 'Zero Line',
            position: 'right',
          },
        },
      ],
    },
  };

  const currentSpread = data.length > 0 ? data[data.length - 1].spread : 0;
  const maxSpread = Math.max(...data.map(d => d.spread));
  const minSpread = Math.min(...data.map(d => d.spread));
  const avgSpread = data.reduce((sum, d) => sum + d.spread, 0) / data.length;
  const volatility = Math.sqrt(
    data.reduce((sum, d) => sum + Math.pow(d.spread - avgSpread, 2), 0) / data.length
  );

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10 px-4 py-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current:</span>
            <span className={`font-bold ${
              currentSpread > threshold ? 'text-green-400' :
              currentSpread < -threshold ? 'text-red-400' :
              'text-slate-300'
            }`}>
              {currentSpread.toFixed(3)}%
            </span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Avg:</span>
            <span className="text-blue-400 font-semibold">{avgSpread.toFixed(3)}%</span>
          </div>
          <div className="w-px h-4 bg-slate-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Vol:</span>
            <span className="text-purple-400 font-semibold">{volatility.toFixed(3)}%</span>
          </div>
        </div>
      </div>

      <ApexCharts 
        options={options} 
        series={series} 
        type="area" 
        height={height} 
      />
      
      <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Range</span>
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-semibold">{minSpread.toFixed(3)}%</span>
              <span className="text-slate-600">to</span>
              <span className="text-green-400 font-semibold">{maxSpread.toFixed(3)}%</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Threshold</span>
            <span className="text-orange-400 font-semibold">±{threshold.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Data Points</span>
            <span className="text-slate-300 font-semibold">{data.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Status</span>
            <span className={`font-semibold ${
              currentSpread > threshold ? 'text-green-400' :
              currentSpread < -threshold ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {currentSpread > threshold ? '🟢 Buy Signal' :
               currentSpread < -threshold ? '🔴 Sell Signal' :
               '⚪ Neutral'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}