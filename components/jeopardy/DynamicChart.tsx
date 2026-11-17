import React from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, ScatterChart, Scatter, ErrorBar, Legend, Label, LineChart, Line, Cell
} from 'recharts';
import { JeopardyQuestion } from './types';
import { formatScientificText } from '../../utils/sanitize';

interface DynamicChartProps {
    q: JeopardyQuestion;
}

export const DynamicChart: React.FC<DynamicChartProps> = ({ q }) => {
    if (!q.chartData || q.chartData.length === 0) return null;
    const type = q.chartType || 'area';

    const keys = Object.keys(q.chartData[0]);
    const hasValue = keys.includes('value');
    const hasValue2 = keys.includes('value2');
    const hasBefore = keys.includes('valueBefore');
    const hasAfter = keys.includes('valueAfter');
    const hasError = keys.includes('error');

    const AxisProps = {
        stroke: "#94a3b8", fontSize: 10, tickLine: false, axisLine: true
    };

    const renderChart = () => {
        const commonProps = { data: q.chartData, margin: { top: 10, right: 10, left: 20, bottom: 40 } };
        const cartesian = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />;
        const xAxis = <XAxis dataKey="label" {...AxisProps} height={60} angle={-25} textAnchor="end" interval={0}><Label value={formatScientificText(q.xAxisLabel || '')} position="insideBottom" offset={-20} style={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} /></XAxis>;
        const yAxis = <YAxis {...AxisProps} width={40}><Label value={formatScientificText(q.yAxisLabel || '')} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#64748b', fontSize: 10, fontWeight: 800 }} /></YAxis>;
        const tooltip = <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }} cursor={{ fill: 'transparent' }} />;
        const legend = <Legend verticalAlign="top" height={36} iconType="circle" />;
        const barColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

        if (type === 'bar') {
            return (
                <BarChart {...commonProps}>
                    {cartesian} {xAxis} {yAxis} {tooltip} {legend}
                    {hasValue && (
                        <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]}>
                            {(q.chartData || []).map((_entry: unknown, index: number) => (
                                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                            ))}
                            {hasError && <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="rgba(0,0,0,1)" />}
                        </Bar>
                    )}
                    {hasValue2 && <Bar dataKey="value2" name="Group 2" fill="#ec4899" radius={[4, 4, 0, 0]} />}
                    {hasBefore && <Bar dataKey="valueBefore" name="Before" fill="#94a3b8" radius={[4, 4, 0, 0]} />}
                    {hasAfter && <Bar dataKey="valueAfter" name="After" fill="#f43f5e" radius={[4, 4, 0, 0]} />}
                </BarChart>
            );
        } else if (type === 'scatter') {
            return (
                <ScatterChart {...commonProps}>
                    {cartesian} {xAxis} {yAxis} {tooltip} {legend}
                    <Scatter name="Data" data={q.chartData} fill="#4f46e5">
                        {hasError && <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="rgba(0,0,0,1)" />}
                    </Scatter>
                </ScatterChart>
            );
        } else if (type === 'line') {
            return (
                <LineChart {...commonProps}>
                    {cartesian} {xAxis} {yAxis} {tooltip} {legend}
                    {hasValue && <Line type="monotone" dataKey="value" name="Value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />}
                    {hasValue2 && <Line type="monotone" dataKey="value2" name="Group 2" stroke="#ec4899" strokeWidth={3} dot={{ r: 3 }} />}
                    {hasBefore && <Line type="monotone" dataKey="valueBefore" name="Before" stroke="#94a3b8" strokeWidth={3} dot={{ r: 3 }} />}
                    {hasAfter && <Line type="monotone" dataKey="valueAfter" name="After" stroke="#f43f5e" strokeWidth={3} dot={{ r: 3 }} />}
                </LineChart>
            );
        } else {
            return (
                <AreaChart {...commonProps}>
                    <defs><linearGradient id="colV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs>
                    {cartesian} {xAxis} {yAxis} {tooltip} {legend}
                    {hasBefore && <Area type="monotone" dataKey="valueBefore" name="Before" stroke="#94a3b8" strokeWidth={3} fillOpacity={0.3} fill="#94a3b8" />}
                    {hasAfter && <Area type="monotone" dataKey="valueAfter" name="After" stroke="#f43f5e" strokeWidth={3} fillOpacity={0.3} fill="#f43f5e" />}
                    {hasValue && <Area type="monotone" dataKey="value" name="Value" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colV)" />}
                    {hasValue2 && <Area type="monotone" dataKey="value2" name="Group 2" stroke="#ec4899" strokeWidth={4} fillOpacity={0.5} fill="#ec4899" />}
                </AreaChart>
            );
        }
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
        </ResponsiveContainer>
    );
};
