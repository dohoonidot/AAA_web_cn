/**
 * Vacation Recommendation Popup 재사용 가능한 UI 컴포넌트
 *
 * GPT 스타일 UI를 위한 애니메이션 위젯과 스타일링된 컨테이너
 * Flutter vacation_ui_components.dart와 동일
 */

import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { VacationUIColors, VacationUIRadius, VacationUISpacing, VacationUIShadows } from './vacationUIConstants';

interface GradientCardProps {
  children: React.ReactNode;
  isDarkTheme: boolean;
  padding?: number | string;
  borderRadius?: number;
  sx?: SxProps<Theme>;
}

/**
 * 그라데이션 카드 래퍼
 * 모든 콘텐츠 박스에 일관된 그라데이션 배경과 플로팅 효과 적용
 */
export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  isDarkTheme,
  padding = VacationUISpacing.paddingXL,
  borderRadius = VacationUIRadius.large,
  sx,
}) => {
  const gradientColors = isDarkTheme
    ? VacationUIColors.darkCardGradient
    : VacationUIColors.lightCardGradient;

  return (
    <Box
      sx={{
        p: typeof padding === 'number' ? `${padding}px` : padding,
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        borderRadius: `${borderRadius}px`,
        border: `1.5px solid ${isDarkTheme ? 'rgba(80, 80, 80, 0.5)' : 'rgba(233, 236, 239, 0.5)'}`,
        boxShadow: VacationUIShadows.cardShadow(isDarkTheme),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

interface GradientIconContainerProps {
  icon: React.ReactNode;
  size?: number;
  gradient?: string[];
}

/**
 * 그라데이션 아이콘 컨테이너
 * 아이콘을 그라데이션 배경과 글로우 효과로 강조
 */
export const GradientIconContainer: React.FC<GradientIconContainerProps> = ({
  icon,
  size = 24,
  gradient = VacationUIColors.primaryGradient,
}) => {
  return (
    <Box
      sx={{
        p: `${size * 0.35}px`,
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        borderRadius: `${size * 0.4}px`,
        boxShadow: VacationUIShadows.iconGlowShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': {
          fontSize: size,
          color: 'white',
        },
      }}
    >
      {icon}
    </Box>
  );
};

interface SectionCardProps {
  children: React.ReactNode;
  isDarkTheme: boolean;
  sx?: SxProps<Theme>;
}

/**
 * 섹션 카드 컴포넌트
 * 각 섹션을 감싸는 카드 스타일
 */
export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  isDarkTheme,
  sx,
}) => {
  const backgroundGradient = isDarkTheme
    ? VacationUIColors.darkBackgroundGradient
    : VacationUIColors.lightBackgroundGradient;

  return (
    <Box
      sx={{
        width: '100%',
        p: `${VacationUISpacing.paddingXL}px`,
        background: `linear-gradient(135deg, ${backgroundGradient[0]} 0%, ${backgroundGradient[1]} 50%, ${backgroundGradient[2]} 100%)`,
        borderRadius: `${VacationUIRadius.medium}px`,
        border: `1px solid ${isDarkTheme ? '#3D3D3D' : '#E2E8F0'}`,
        boxShadow: VacationUIShadows.cardShadow(isDarkTheme),
        mb: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  gradient: string[];
  isDarkTheme: boolean;
}

/**
 * 섹션 헤더 컴포넌트
 * 아이콘 + 제목으로 구성된 섹션 헤더
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  gradient,
  isDarkTheme,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2.5 }}>
      <Box
        sx={{
          p: 1.25,
          borderRadius: `${VacationUIRadius.small}px`,
          background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: VacationUIShadows.iconGlowShadow,
          '& svg': {
            color: 'white',
            fontSize: 20,
          },
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: '18px',
          fontWeight: 700,
          color: isDarkTheme ? '#FFFFFF' : '#1E293B',
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

interface SubSectionTitleProps {
  title: string;
  isDarkTheme: boolean;
}

/**
 * 서브 섹션 제목 컴포넌트
 */
export const SubSectionTitle: React.FC<SubSectionTitleProps> = ({
  title,
  isDarkTheme,
}) => {
  return (
    <Typography
      sx={{
        fontSize: '15px',
        fontWeight: 600,
        color: isDarkTheme ? '#FFFFFF' : '#374151',
        mb: 1.5,
      }}
    >
      {title}
    </Typography>
  );
};

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  show?: boolean;
}

/**
 * 섹션 페이드인 애니메이션 래퍼
 */
export const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  delay = 0,
  show = true,
}) => {
  return (
    <Fade in={show} timeout={600 + delay}>
      <Box>{children}</Box>
    </Fade>
  );
};

interface LoadingStatusBoxProps {
  statusLines: string[];
  isComplete: boolean;
  isDarkTheme: boolean;
}

/**
 * 로딩 상태 메시지 박스
 */
export const LoadingStatusBox: React.FC<LoadingStatusBoxProps> = ({
  statusLines,
  isComplete,
  isDarkTheme,
}) => {
  if (statusLines.length === 0) return null;

  return (
    <Box
      sx={{
        p: 1.75,
        bgcolor: isDarkTheme ? 'rgba(30, 30, 30, 0.6)' : '#F1F5F9',
        borderRadius: `${VacationUIRadius.small}px`,
        border: `1px solid ${isDarkTheme ? '#3D3D3D' : '#E2E8F0'}`,
        mb: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: isComplete ? '#10B981' : '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isComplete ? (
            <Typography sx={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓</Typography>
          ) : (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'white',
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          )}
        </Box>
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 600,
            color: isDarkTheme ? '#FFFFFF' : '#374151',
          }}
        >
          {isComplete ? '데이터 로드 완료' : '데이터 로드 중...'}
        </Typography>
      </Box>
      {statusLines.map((line, index) => (
        <Typography
          key={index}
          sx={{
            fontSize: '12px',
            lineHeight: 1.5,
            color: isDarkTheme ? '#9CA3AF' : '#6B7280',
            mb: 0.5,
          }}
        >
          {line}
        </Typography>
      ))}
    </Box>
  );
};

/**
 * 마크다운 테이블 위젯
 */
interface MarkdownTableWidgetProps {
  tableData: string[][];
  isDarkTheme: boolean;
}

export const MarkdownTableWidget: React.FC<MarkdownTableWidgetProps> = ({
  tableData,
  isDarkTheme,
}) => {
  if (tableData.length === 0) return null;

  return (
    <Box
      sx={{
        my: 2,
        mx: 'auto',
        maxWidth: '500px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${isDarkTheme ? '#505050' : '#E9ECEF'}`,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ backgroundColor: isDarkTheme ? '#4A4A4A' : '#F8F9FA' }}>
            {tableData[0]?.map((cell, index) => (
              <th
                key={index}
                style={{
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: isDarkTheme ? '#FFFFFF' : '#1A1D29',
                  borderBottom: `1px solid ${isDarkTheme ? '#505050' : '#E9ECEF'}`,
                  textAlign: index === 0 ? 'center' : 'left',
                }}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: rowIndex < tableData.length - 2
                  ? `1px solid ${isDarkTheme ? '#505050' : '#E9ECEF'}`
                  : 'none',
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: isDarkTheme ? '#FFFFFF' : '#1A1D29',
                    textAlign: cellIndex === 0 ? 'center' : 'left',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

/**
 * 연속 휴가 기간 카드
 */
interface ConsecutivePeriodCardProps {
  period: {
    startDate: string;
    endDate: string;
    days: number;
    description: string;
  };
  isDarkTheme: boolean;
}

export const ConsecutivePeriodCard: React.FC<ConsecutivePeriodCardProps> = ({
  period,
  isDarkTheme,
}) => {
  return (
    <Box
      sx={{
        p: 1.75,
        mb: 1.25,
        background: `linear-gradient(135deg, ${isDarkTheme ? VacationUIColors.darkCardGradient[0] : VacationUIColors.lightCardGradient[0]} 0%, ${isDarkTheme ? VacationUIColors.darkCardGradient[1] : VacationUIColors.lightCardGradient[1]} 100%)`,
        borderRadius: `${VacationUIRadius.small}px`,
        border: `1px solid rgba(102, 126, 234, 0.3)`,
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
      }}
    >
      <GradientIconContainer
        icon={<span style={{ fontSize: 14 }}>📅</span>}
        size={16}
      />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: isDarkTheme ? '#FFFFFF' : '#1E293B',
            }}
          >
            {`${period.startDate} ~ ${period.endDate}`}
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              bgcolor: '#667EEA',
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {`${period.days}일`}
          </Box>
        </Box>
        <Typography
          sx={{
            fontSize: '12px',
            color: isDarkTheme ? '#9CA3AF' : '#6B7280',
            lineHeight: 1.5,
          }}
        >
          {period.description}
        </Typography>
      </Box>
    </Box>
  );
};
