import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface MonthlyDistributionChartProps {
  monthlyData: Record<string, number>;
  isDarkTheme: boolean;
}

const MonthlyDistributionChart: React.FC<MonthlyDistributionChartProps> = ({
  monthlyData,
  isDarkTheme,
}) => {
  const data = useMemo(() => {
    const normalized: Record<number, number> = {};
    Object.entries(monthlyData).forEach(([key, value]) => {
      if (typeof value !== 'number' || Number.isNaN(value)) return;
      if (/^\d{4}-\d{2}$/.test(key)) {
        const month = parseInt(key.split('-')[1], 10);
        normalized[month] = value;
      } else if (/^\d{1,2}$/.test(key)) {
        const month = parseInt(key, 10);
        normalized[month] = value;
      }
    });

    return Array.from({ length: 12 }, (_, idx) => {
      const month = idx + 1;
      return {
        month,
        label: `${month}월`,
        days: normalized[month] ?? 0,
      };
    });
  }, [monthlyData]);

  const maxY = useMemo(() => {
    if (data.length === 0) return 5;
    const maxValue = Math.max(...data.map((item) => item.days));
    return Math.ceil(maxValue + 1);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: '#111827',
            p: 1.2,
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>
            {`${payload[0].value.toFixed(1)}일`}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', height: 250, p: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke={isDarkTheme ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.5)'}
          />
          <XAxis
            dataKey="label"
            axisLine={{ stroke: isDarkTheme ? '#4B5563' : '#CBD5E1' }}
            tickLine={false}
            tick={{ fill: isDarkTheme ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={{ stroke: isDarkTheme ? '#4B5563' : '#CBD5E1' }}
            tickLine={false}
            tickFormatter={(value) => `${value}일`}
            tick={{ fill: isDarkTheme ? '#9CA3AF' : '#6B7280', fontSize: 11 }}
            interval={0}
            domain={[0, maxY]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }} />
          <Bar
            dataKey="days"
            fill="#4A90E2"
            barSize={20}
            radius={[4, 4, 0, 0]}
            background={{ fill: isDarkTheme ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MonthlyDistributionChart;
