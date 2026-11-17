import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { cleanHtml, formatScientificText } from '../utils/sanitize';
import {
    calculateFiveNumberSummary,
    calculateHistogramBins,
    BoxPlotSummary,
    DistributionStats,
} from '../services/graphingEngine';

export type GraphType =
    | 'line'
    | 'bar'
    | 'scatter'
    | 'histogram'
    | 'box_plot'
    | 'box_and_whisker';

export interface GraphConfig {
    type: GraphType;
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    data: Array<Record<string, number | string>>;
    series: Array<{
        key: string;       // key in data object
        name: string;      // Display name (Legend)
        color?: string;
    }>;
    boxPlotData?: BoxPlotSummary[];
    binCount?: number;
}

interface DataChartProps {
    config: GraphConfig;
    className?: string;
}

const COLORS = ['#4f46e5', '#db2777', '#059669', '#d97706', '#7c3aed'];

const DataChart: React.FC<DataChartProps> = ({ config, className = '' }) => {
    const [hoveredBox, setHoveredBox] = useState<BoxPlotSummary | null>(null);

    // 1. Validate data array presence safely
    const isValid = Boolean(
        config &&
        Array.isArray(config.data) &&
        config.data.length > 0 &&
        Array.isArray(config.series) &&
        config.series.length > 0
    );

    const firstItem = isValid ? config.data[0] : null;
    const xKey = firstItem
        ? 'name' in firstItem
            ? 'name'
            : 'x' in firstItem
            ? 'x'
            : Object.keys(firstItem)[0]
        : 'x';

    // Compute histogram data if type is 'histogram'
    const histogramData = useMemo(() => {
        if (!isValid || config.type !== 'histogram' || !firstItem) return null;

        // Check if data is already pre-binned (has binLabel or count)
        if ('binLabel' in firstItem || 'count' in firstItem) {
            return {
                bins: config.data,
                stats: null,
            };
        }

        // Otherwise, extract raw numbers from the first series key
        const seriesKey = config.series[0]?.key || 'y';
        const rawNumbers = config.data
            .map((d) => Number(d[seriesKey]))
            .filter((v) => !isNaN(v));

        return calculateHistogramBins(rawNumbers, config.binCount);
    }, [isValid, config, firstItem]);

    // Compute box plot summaries if type is 'box_plot' or 'box_and_whisker'
    const boxPlotSummaries = useMemo<BoxPlotSummary[]>(() => {
        if (!isValid || (config.type !== 'box_plot' && config.type !== 'box_and_whisker')) return [];
        if (config.boxPlotData && config.boxPlotData.length > 0) {
            return config.boxPlotData;
        }

        // Extract series values
        return config.series.map((s) => {
            const rawNumbers = config.data
                .map((d) => Number(d[s.key]))
                .filter((v) => !isNaN(v));
            return calculateFiveNumberSummary(rawNumbers, s.name);
        });
    }, [isValid, config]);

    if (!isValid) {
        return (
            <div className={`flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-slate-400 text-sm font-medium ${className}`}>
                No chart data available or invalid format
            </div>
        );
    }

    const renderChart = () => {
        const commonProps = {
            data: config.data,
            margin: { top: 20, right: 30, left: 70, bottom: 40 }
        };

        switch (config.type) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey={xKey}
                            label={{ value: formatScientificText(config.xAxisLabel), position: 'bottom', offset: 0, dy: 10, style: { fontSize: 12, fill: '#64748b' } }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis
                            label={{ value: formatScientificText(config.yAxisLabel), angle: -90, position: 'left', offset: 0, style: { fontSize: 12, fill: '#64748b', textAnchor: 'middle' } }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} verticalAlign="top" />
                        {config.series.map((s, i) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.name}
                                fill={s.color || COLORS[i % COLORS.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case 'scatter':
                return (
                    <ScatterChart margin={{ top: 20, right: 30, left: 70, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name={config.xAxisLabel}
                            label={{ value: formatScientificText(config.xAxisLabel), position: 'bottom', offset: 0, dy: 10, style: { fontSize: 12, fill: '#64748b' } }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name={config.yAxisLabel}
                            label={{ value: formatScientificText(config.yAxisLabel), angle: -90, position: 'left', offset: 0, style: { fontSize: 12, fill: '#64748b', textAnchor: 'middle' } }}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} verticalAlign="top" />
                        {config.series.map((s, i) => (
                            <Scatter
                                key={s.key}
                                name={s.name}
                                data={config.data}
                                fill={s.color || COLORS[i % COLORS.length]}
                            />
                        ))}
                    </ScatterChart>
                );

            case 'histogram': {
                const histBins = histogramData?.bins || [];
                const stats: DistributionStats | null = histogramData?.stats || null;

                return (
                    <div className="w-full h-full flex flex-col">
                        {stats && (
                            <div className="flex flex-wrap items-center justify-center gap-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    Mean: <strong>{stats.mean}</strong>
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    Median: <strong>{stats.median}</strong>
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    Std Dev: <strong>{stats.stdDev}</strong>
                                </span>
                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    N = <strong>{stats.sampleSize}</strong>
                                </span>
                            </div>
                        )}
                        <div className="flex-1 w-full min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={histBins}
                                    barCategoryGap={1}
                                    margin={{ top: 10, right: 30, left: 60, bottom: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="binLabel"
                                        label={{
                                            value: formatScientificText(config.xAxisLabel),
                                            position: 'bottom',
                                            offset: 0,
                                            dy: 10,
                                            style: { fontSize: 12, fill: '#64748b' },
                                        }}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        label={{
                                            value: formatScientificText(config.yAxisLabel || 'Frequency'),
                                            angle: -90,
                                            position: 'left',
                                            offset: 0,
                                            style: { fontSize: 12, fill: '#64748b', textAnchor: 'middle' },
                                        }}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        formatter={(val: unknown) => [`${val} occurrences`, 'Frequency']}
                                        labelFormatter={(label) => `Interval: ${label}`}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        name={config.series[0]?.name || 'Frequency'}
                                        fill={config.series[0]?.color || '#4f46e5'}
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            }

            case 'box_plot':
            case 'box_and_whisker': {
                // Determine scale bounds across all series
                const allValues = boxPlotSummaries.flatMap((b) => [
                    b.min,
                    b.max,
                    ...b.outliers,
                ]);
                const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
                const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
                const padding = (dataMax - dataMin) * 0.1 || 5;
                const yMin = Math.floor(dataMin - padding);
                const yMax = Math.ceil(dataMax + padding);
                const yRange = yMax - yMin || 1;

                const svgHeight = 260;
                const svgWidth = Math.max(380, boxPlotSummaries.length * 150);
                const plotTop = 20;
                const plotBottom = svgHeight - 40;
                const plotHeight = plotBottom - plotTop;
                const leftMargin = 60;
                const rightMargin = 30;
                const plotWidth = svgWidth - leftMargin - rightMargin;

                const getY = (val: number) => {
                    const ratio = (val - yMin) / yRange;
                    return plotBottom - ratio * plotHeight;
                };

                const groupSpacing = plotWidth / (boxPlotSummaries.length || 1);

                return (
                    <div className="w-full flex flex-col items-center">
                        <div className="w-full overflow-x-auto">
                            <svg
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                className="w-full h-[260px] select-none"
                            >
                                {/* Horizontal grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
                                    const val = yMin + step * yRange;
                                    const y = getY(val);
                                    return (
                                        <g key={idx}>
                                            <line
                                                x1={leftMargin}
                                                y1={y}
                                                x2={svgWidth - rightMargin}
                                                y2={y}
                                                stroke="#e2e8f0"
                                                strokeDasharray="3 3"
                                            />
                                            <text
                                                x={leftMargin - 8}
                                                y={y + 4}
                                                textAnchor="end"
                                                fontSize={10}
                                                fill="#64748b"
                                            >
                                                {val.toFixed(1)}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Y-Axis Line */}
                                <line
                                    x1={leftMargin}
                                    y1={plotTop}
                                    x2={leftMargin}
                                    y2={plotBottom}
                                    stroke="#94a3b8"
                                    strokeWidth={1.5}
                                />

                                {/* Y-Axis Label */}
                                <text
                                    x={15}
                                    y={svgHeight / 2}
                                    transform={`rotate(-90 15 ${svgHeight / 2})`}
                                    textAnchor="middle"
                                    fontSize={11}
                                    fill="#64748b"
                                    fontWeight="bold"
                                >
                                    {config.yAxisLabel || 'Values'}
                                </text>

                                {/* Box plots */}
                                {boxPlotSummaries.map((b, idx) => {
                                    const cx = leftMargin + (idx + 0.5) * groupSpacing;
                                    const boxWidth = Math.min(60, groupSpacing * 0.5);
                                    const color = config.series[idx]?.color || COLORS[idx % COLORS.length];

                                    const yQ1 = getY(b.q1);
                                    const yQ3 = getY(b.q3);
                                    const yMedian = getY(b.median);
                                    const yLowerWhisker = getY(b.lowerWhisker);
                                    const yUpperWhisker = getY(b.upperWhisker);

                                    return (
                                        <g
                                            key={idx}
                                            className="cursor-pointer transition-opacity hover:opacity-90"
                                            onMouseEnter={() => setHoveredBox(b)}
                                            onMouseLeave={() => setHoveredBox(null)}
                                        >
                                            {/* Lower Whisker Line and Cap */}
                                            <line
                                                x1={cx}
                                                y1={yQ1}
                                                x2={cx}
                                                y2={yLowerWhisker}
                                                stroke={color}
                                                strokeWidth={2}
                                                strokeDasharray="2 2"
                                            />
                                            <line
                                                x1={cx - boxWidth / 4}
                                                y1={yLowerWhisker}
                                                x2={cx + boxWidth / 4}
                                                y2={yLowerWhisker}
                                                stroke={color}
                                                strokeWidth={2}
                                            />

                                            {/* Upper Whisker Line and Cap */}
                                            <line
                                                x1={cx}
                                                y1={yQ3}
                                                x2={cx}
                                                y2={yUpperWhisker}
                                                stroke={color}
                                                strokeWidth={2}
                                                strokeDasharray="2 2"
                                            />
                                            <line
                                                x1={cx - boxWidth / 4}
                                                y1={yUpperWhisker}
                                                x2={cx + boxWidth / 4}
                                                y2={yUpperWhisker}
                                                stroke={color}
                                                strokeWidth={2}
                                            />

                                            {/* Box Body (from Q3 down to Q1) */}
                                            <rect
                                                x={cx - boxWidth / 2}
                                                y={yQ3}
                                                width={boxWidth}
                                                height={Math.max(2, yQ1 - yQ3)}
                                                fill={color}
                                                fillOpacity={0.25}
                                                stroke={color}
                                                strokeWidth={2}
                                                rx={4}
                                            />

                                            {/* Median Line */}
                                            <line
                                                x1={cx - boxWidth / 2}
                                                y1={yMedian}
                                                x2={cx + boxWidth / 2}
                                                y2={yMedian}
                                                stroke={color}
                                                strokeWidth={3}
                                            />

                                            {/* Outlier Points */}
                                            {b.outliers.map((outVal, oIdx) => (
                                                <circle
                                                    key={oIdx}
                                                    cx={cx}
                                                    cy={getY(outVal)}
                                                    r={3.5}
                                                    fill="#f43f5e"
                                                    stroke="#fff"
                                                    strokeWidth={1}
                                                />
                                            ))}

                                            {/* X-Axis Category Label */}
                                            <text
                                                x={cx}
                                                y={plotBottom + 18}
                                                textAnchor="middle"
                                                fontSize={11}
                                                fontWeight="bold"
                                                fill="#475569"
                                            >
                                                {b.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Interactive Box Plot Five-Number Summary HUD */}
                        {hoveredBox ? (
                            <div className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-200">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {hoveredBox.label} Five-Number Summary:
                                </span>
                                <span>Min: <strong>{hoveredBox.min}</strong></span>
                                <span>Q1: <strong>{hoveredBox.q1}</strong></span>
                                <span>Median: <strong className="text-emerald-600 dark:text-emerald-400">{hoveredBox.median}</strong></span>
                                <span>Q3: <strong>{hoveredBox.q3}</strong></span>
                                <span>Max: <strong>{hoveredBox.max}</strong></span>
                                <span>IQR: <strong>{hoveredBox.iqr}</strong></span>
                                {hoveredBox.outliers.length > 0 && (
                                    <span className="text-rose-500 font-bold">
                                        Outliers ({hoveredBox.outliers.length}): {hoveredBox.outliers.join(', ')}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="text-[11px] text-slate-400 mt-1 italic">
                                Hover over any box to inspect full 5-number summary (Min, Q1, Median, Q3, Max, IQR).
                            </div>
                        )}
                    </div>
                );
            }

            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey={xKey}
                            label={{ value: formatScientificText(config.xAxisLabel), position: 'bottom', offset: 0, dy: 10, style: { fontSize: 12, fill: '#64748b' } }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis
                            label={{ value: formatScientificText(config.yAxisLabel), angle: -90, position: 'left', offset: 0, style: { fontSize: 12, fill: '#64748b', textAnchor: 'middle' } }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} verticalAlign="top" />
                        {config.series.map((s, i) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.name}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <div className={`w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 ${className}`}>
            <h4
                className="text-center font-bold text-slate-700 dark:text-slate-200 mb-4"
                dangerouslySetInnerHTML={{ __html: cleanHtml(config.title) }}
            />
            <div className="w-full min-h-[300px]">
                {config.type === 'box_plot' || config.type === 'box_and_whisker' || config.type === 'histogram' ? (
                    renderChart()
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        {renderChart()}
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default DataChart;
