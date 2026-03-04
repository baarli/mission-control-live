/* ============================================
   LINE CHART COMPONENT (SVG)
   ============================================ */

import React, { useState, useMemo } from 'react';

import type { ChartDataPoint } from '../../types';

import styles from './LineChart.module.css';

interface LineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showArea?: boolean;
  showPoints?: boolean;
  yAxisFormatter?: (value: number) => string;
}

const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 60 };

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 280,
  color = '#6366f1',
  showGrid = true,
  showArea = true,
  showPoints = true,
  yAxisFormatter = v => v.toString(),
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const padding = CHART_PADDING;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { minValue, maxValue, points, pathD, areaD } = useMemo(() => {
    if (data.length === 0) {
      return {
        minValue: 0,
        maxValue: 0,
        yScale: () => 0,
        xScale: () => 0,
        points: [],
        pathD: '',
        areaD: '',
      };
    }

    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const yScale = (value: number) => {
      return CHART_PADDING.top + chartHeight - ((value - minValue) / range) * chartHeight;
    };

    const xScale = (index: number) => {
      return CHART_PADDING.left + (index / (data.length - 1)) * chartWidth;
    };

    const points = data.map((d, i) => ({
      x: xScale(i),
      y: yScale(d.value),
      value: d.value,
      label: d.label,
    }));

    // Generate path
    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;

      // Smooth curve using cubic bezier
      const prev = points[i - 1]!;
      const cpx1 = prev.x + (point.x - prev.x) / 3;
      const cpy1 = prev.y;
      const cpx2 = prev.x + (2 * (point.x - prev.x)) / 3;
      const cpy2 = point.y;

      return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
    }, '');

    // Generate area path
    const lastPoint = points[points.length - 1]!;
    const firstPoint = points[0]!;
    const areaD = `${pathD} L ${lastPoint.x} ${CHART_PADDING.top + chartHeight} L ${firstPoint.x} ${CHART_PADDING.top + chartHeight} Z`;

    return { minValue, maxValue, yScale, xScale, points, pathD, areaD };
  }, [data, chartWidth, chartHeight]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find closest point
    let closestIndex = 0;
    let closestDistance = Infinity;

    points.forEach((point, i) => {
      const distance = Math.abs(point.x - x);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    if (closestDistance < 50) {
      setHoveredIndex(closestIndex);
      const closest = points[closestIndex];
      if (closest) {
        setTooltipPos({ x: closest.x, y: closest.y });
      }
    } else {
      setHoveredIndex(null);
      setTooltipPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  if (data.length === 0) {
    return (
      <div className={styles.empty} style={{ width, height }}>
        <span>Ingen data å vise</span>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        className={styles.svg}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid lines */}
        {showGrid && (
          <g className={styles.grid}>
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = padding.top + chartHeight * ratio;
              const value = maxValue - (maxValue - minValue) * ratio;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    className={styles.gridLine}
                  />
                  <text x={padding.left - 10} y={y + 4} className={styles.yLabel}>
                    {yAxisFormatter(Math.round(value))}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Area fill */}
        {showArea && <path d={areaD} className={styles.area} style={{ fill: color }} />}

        {/* Line */}
        <path d={pathD} className={styles.line} style={{ stroke: color }} />

        {/* Points */}
        {showPoints &&
          points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === i ? 6 : 4}
              className={[styles.point, hoveredIndex === i && styles.pointActive]
                .filter(Boolean)
                .join(' ')}
              style={{
                fill: hoveredIndex === i ? color : 'var(--bg-primary)',
                stroke: color,
              }}
            />
          ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = padding.left + (i / (data.length - 1)) * chartWidth;
          const showLabel = data.length <= 8 || i % Math.ceil(data.length / 8) === 0;

          return showLabel ? (
            <text key={i} x={x} y={height - 10} className={styles.xLabel}>
              {d.label}
            </text>
          ) : null;
        })}
      </svg>

      {/* Tooltip */}
      {tooltipPos && hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(tooltipPos.x + 10, width - 100),
            top: Math.max(tooltipPos.y - 40, 0),
          }}
        >
          <div className={styles.tooltipValue}>{yAxisFormatter(points[hoveredIndex]!.value)}</div>
          <div className={styles.tooltipLabel}>{points[hoveredIndex]!.label}</div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
