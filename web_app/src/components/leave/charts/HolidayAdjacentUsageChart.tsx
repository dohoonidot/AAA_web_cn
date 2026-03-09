import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface HolidayAdjacentUsageChartProps {
  usageRate: number; // 0.0 ~ 1.0
  isDarkTheme: boolean;
}

const HolidayAdjacentUsageChart: React.FC<HolidayAdjacentUsageChartProps> = ({
  usageRate,
  isDarkTheme,
}) => {
  const percentage = (usageRate * 100).toFixed(2);

  const data = [
    { name: '공휴일 인접 사용', value: usageRate * 100 },
    { name: '기타 사용', value: (1 - usageRate) * 100 },
  ];

  const colors = ['#4A90E2', isDarkTheme ? '#6B7280' : '#D1D5DB'];

  return (
    <Box
      sx={{
        width: '100%',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <Box sx={{ width: 100, height: 100 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={25}
              outerRadius={40}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
              labelLine={false}
              label={({ index, cx, cy, midAngle, innerRadius, outerRadius }) => {
                if (index !== 0) return null;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-(midAngle ?? 0) * (Math.PI / 180));
                const y = cy + radius * Math.sin(-(midAngle ?? 0) * (Math.PI / 180));
                return (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#FFFFFF"
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {`${percentage}%`}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: '12px',
            fontWeight: 700,
            color: isDarkTheme ? '#FFFFFF' : '#1A1D29',
          }}
        >
          공휴일 인접 사용률
        </Typography>
        <Typography
          sx={{
            fontSize: '10px',
            color: isDarkTheme ? '#9CA3AF' : '#6B7280',
            lineHeight: 1.3,
            mt: 0.5,
          }}
        >
          전체 연차 중 공휴일과 인접한 날짜에 사용한 비율입니다
        </Typography>
      </Box>
    </Box>
  );
};

export default HolidayAdjacentUsageChart;
