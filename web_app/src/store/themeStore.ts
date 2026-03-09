import { create } from 'zustand';
import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Flutter의 AppThemeMode와 동일
export enum AppThemeMode {
  LIGHT = 'light',
  CODING_DARK = 'codingDark',
  SYSTEM = 'system',
}

// Flutter의 AppColorScheme과 동일한 색상 스킴
interface AppColorScheme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  sidebarGradientStart: string;
  sidebarGradientEnd: string;
  chatUserBubbleColor: string;
  chatAiBubbleColor: string;
  chatInputBackgroundColor: string;
  appBarBackgroundColor: string;
  appBarTextColor: string;
  appBarGradientStart: string;
  appBarGradientEnd: string;
  textFieldBorderColor: string;
  textFieldFillColor: string;
  copyButtonColor: string;
  scrollButtonColor: string;
  textColor: string;
  hintTextColor: string;
  userMessageTextColor: string;
  aiMessageTextColor: string;
  markdownTextColor: string;
  codeTextColor: string;
  tableTextColor: string;
  linkTextColor: string;
  codeBlockBackgroundColor: string;
  codeBlockTextColor: string;
}

// Flutter의 lightScheme과 동일
const lightScheme: AppColorScheme = {
  name: 'Light',
  primaryColor: '#1976D2',
  secondaryColor: '#03DAC6',
  backgroundColor: '#FFFFFF',
  surfaceColor: '#FFFFFF',
  sidebarBackgroundColor: '#F7F7F8',
  sidebarTextColor: '#202123',
  sidebarGradientStart: '#FAFAFA',
  sidebarGradientEnd: '#F0F0F0',
  chatUserBubbleColor: '#FFFFFF',
  chatAiBubbleColor: '#FFFFFF',
  chatInputBackgroundColor: '#FFFFFF',
  appBarBackgroundColor: '#F7F7F8',
  appBarTextColor: '#202123',
  appBarGradientStart: '#FAFAFA',
  appBarGradientEnd: '#F0F0F0',
  textFieldBorderColor: '#E5E5E5',
  textFieldFillColor: '#FFFFFF',
  copyButtonColor: '#202123',
  scrollButtonColor: '#10A37F',
  textColor: '#202123',
  hintTextColor: '#6B7280',
  userMessageTextColor: '#000000',
  aiMessageTextColor: '#202123',
  markdownTextColor: '#202123',
  codeTextColor: '#202123',
  tableTextColor: '#202123',
  linkTextColor: '#10A37F',
  codeBlockBackgroundColor: '#FCFCFC',
  codeBlockTextColor: '#000000',
};

// Flutter의 codingDarkScheme과 동일
const codingDarkScheme: AppColorScheme = {
  name: 'Dark',
  primaryColor: '#E2E8F0',
  secondaryColor: '#CBD5E1',
  backgroundColor: '#111827',
  surfaceColor: '#1F2937',
  sidebarBackgroundColor: '#111827',
  sidebarTextColor: '#E5E7EB',
  sidebarGradientStart: '#1F2937',
  sidebarGradientEnd: '#111827',
  chatUserBubbleColor: '#2B3A52',
  chatAiBubbleColor: '#1B2536',
  chatInputBackgroundColor: '#111827',
  appBarBackgroundColor: '#111827',
  appBarTextColor: '#E5E7EB',
  appBarGradientStart: '#1F2937',
  appBarGradientEnd: '#111827',
  textFieldBorderColor: '#475569',
  textFieldFillColor: '#1F2937',
  copyButtonColor: '#94A3B8',
  scrollButtonColor: '#94A3B8',
  textColor: '#E5E7EB',
  hintTextColor: 'rgba(226, 232, 240, 0.82)',
  userMessageTextColor: '#FFFFFF',
  aiMessageTextColor: '#E5E7EB',
  markdownTextColor: '#E5E7EB',
  codeTextColor: '#E5E7EB',
  tableTextColor: '#E5E7EB',
  linkTextColor: '#93C5FD',
  codeBlockBackgroundColor: '#0A0F1D',
  codeBlockTextColor: '#CBD5E1',
};

interface ThemeState {
  themeMode: AppThemeMode;
  colorScheme: AppColorScheme;
  muiTheme: Theme;
  setThemeMode: (mode: AppThemeMode) => void;
  toggleTheme: () => void;
}

// 시스템 테마 감지
const getSystemTheme = (): AppThemeMode => {
  if (typeof window === 'undefined') return AppThemeMode.LIGHT;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? AppThemeMode.CODING_DARK
    : AppThemeMode.LIGHT;
};

// MUI 테마 생성
const createMuiThemeFromScheme = (scheme: AppColorScheme): Theme => {
  return createTheme({
    palette: {
      mode: scheme.name === 'Dark' ? 'dark' : 'light',
      primary: {
        main: scheme.primaryColor,
      },
      secondary: {
        main: scheme.secondaryColor,
      },
      background: {
        default: scheme.backgroundColor,
        paper: scheme.surfaceColor,
      },
      text: {
        primary: scheme.textColor,
        secondary: scheme.hintTextColor,
      },
    },
    typography: {
      fontFamily: '"Spoqa Han Sans Neo", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
};

export const useThemeStore = create<ThemeState>((set, get) => {
  // 초기 테마 모드 (로컬 스토리지에서 가져오기)
  const savedTheme = localStorage.getItem('themeMode') as AppThemeMode | null;
  const initialMode = savedTheme || AppThemeMode.LIGHT;

  // 시스템 테마 모드인 경우 실제 테마 결정
  const effectiveMode = initialMode === AppThemeMode.SYSTEM
    ? getSystemTheme()
    : initialMode;

  const colorScheme = effectiveMode === AppThemeMode.CODING_DARK
    ? codingDarkScheme
    : lightScheme;

  const muiTheme = createMuiThemeFromScheme(colorScheme);

  return {
    themeMode: initialMode,
    colorScheme,
    muiTheme,
    setThemeMode: (mode: AppThemeMode) => {
      const effectiveMode = mode === AppThemeMode.SYSTEM
        ? getSystemTheme()
        : mode;

      const colorScheme = effectiveMode === AppThemeMode.CODING_DARK
        ? codingDarkScheme
        : lightScheme;

      const muiTheme = createMuiThemeFromScheme(colorScheme);

      localStorage.setItem('themeMode', mode);

      set({ themeMode: mode, colorScheme, muiTheme });
    },
    toggleTheme: () => {
      const current = get().themeMode;
      const newMode = current === AppThemeMode.LIGHT
        ? AppThemeMode.CODING_DARK
        : AppThemeMode.LIGHT;

      get().setThemeMode(newMode);
    },
  };
});

// 시스템 테마 변경 감지
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState();
    if (store.themeMode === AppThemeMode.SYSTEM) {
      store.setThemeMode(AppThemeMode.SYSTEM);
    }
  });
}
