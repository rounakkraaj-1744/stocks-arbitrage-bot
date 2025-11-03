"use client";

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import { ChartDataPoint } from '@/lib/types';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SpreadChartProps {
  data: ChartDataPoint[];
  threshold: number;
  height?: number;
}

export function SpreadChart({ data, threshold, height = 400 }: SpreadChartProps) {
  const chartRef = useRef<any>(null);
  const categories = data.map((point) => point.time);
  
  const series = [{
    name: "Spread %",
    data: data.map((point) => point.spread),
  }];

  const options: ApexOptions = {
    chart: {
      type: "area",
      zoom: { 
        enabled: true, 
        type: "x",
        autoScaleYaxis: false, // ✅ Prevent auto-zoom-out
      },
      toolbar: { show: true },
      background: "transparent",
      animations: {
        enabled: false, // ✅ Disable animations
      },
    },
    stroke: { width: 2, curve: "smooth" },
    colors: ["#fb923c"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      y: {
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(2)}%`;
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: { colors: "#64748b", fontSize: "11px" },
      },
      axisBorder: { show: true, color: "#334155" },
      axisTicks: { show: true, color: "#334155" },
    },
    yaxis: {
      title: { text: "Spread %", style: { color: "#64748b" } },
      labels: {
        style: { colors: ["#64748b"] },
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(2)}%`;
        },
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#64748b" },
    },
    grid: {
      borderColor: "#334155",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      yaxis: [
        {
          y: threshold,
          borderColor: "#22c55e",
          strokeDashArray: 5,
          label: {
            borderColor: "#22c55e",
            style: { color: "#fff", background: "#22c55e" },
            text: "Buy Zone",
          },
        },
        {
          y: -threshold,
          borderColor: "#ef4444",
          strokeDashArray: 5,
          label: {
            borderColor: "#ef4444",
            style: { color: "#fff", background: "#ef4444" },
            text: "Sell Zone",
          },
        },
        {
          y: 0,
          borderColor: "#64748b",
          strokeDashArray: 5,
        },
      ],
    },
  };

  return (
    <ApexCharts
      options={options} 
      series={series} 
      type="area" 
      height={height} 
    />
  );
}
