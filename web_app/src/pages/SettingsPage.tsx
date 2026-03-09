import { useSettingsPageState, type ThemeMode } from './SettingsPage.state';
import { Alert } from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import MobileMainLayout from '../components/layout/MobileMainLayout';
import PrivacyAgreementDialog from '../components/auth/PrivacyAgreementDialog';

const THEME_OPTIONS: { value: ThemeMode; label: string; desc: string }[] = [
  { value: 'light', label: '라이트', desc: '밝은 화면' },
  { value: 'dark',  label: '다크',   desc: '어두운 화면' },
  { value: 'system', label: '시스템', desc: '기기 설정 따름' },
];

const INFO_ROWS = [
  { label: '버전',    value: 'Web' },
  { label: '빌드',    value: '20241021' },
  { label: '개발사',  value: 'ASPN' },
];

export default function SettingsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { state, actions } = useSettingsPageState();
  const { privacyAgreed, privacyDialogOpen, error, userInfo, themeMode } = state;
  const { setPrivacyDialogOpen, handleLogout, handleThemeChange, loadPrivacyStatus, navigate } = actions;

  // 색상 팔레트
  const bg      = isDark ? '#0f172a' : '#f1f5f9';
  const card    = isDark ? '#1e293b' : '#ffffff';
  const border  = isDark ? '#334155' : '#e2e8f0';
  const text    = isDark ? '#f1f5f9' : '#0f172a';
  const sub     = isDark ? '#94a3b8' : '#64748b';
  const rowBg   = isDark ? '#0f172a' : '#f8fafc';

  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div style={{
      background: card,
      border: `1px solid ${border}`,
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px',
        borderBottom: `1px solid ${border}`,
        background: isDark ? '#243347' : '#f8fafc',
      }}>
        <span style={{ color: '#3b82f6', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );

  return (
    <MobileMainLayout
      hideAppBar={false}
      hideSidebarOnDesktop={true}
      title="환경 설정"
      showBackButton={true}
      hideGiftButton={true}
      onBackClick={() => navigate('/chat')}
    >
      <div style={{
        height: 'var(--app-height, 100vh)',
        overflowY: 'auto',
        background: bg,
        padding: '20px 16px',
        boxSizing: 'border-box',
      }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        )}

        {/* 내 계정정보 */}
        <Section icon={<AccountIcon fontSize="small" />} title="내 계정정보">
          {userInfo && (
            <div style={{
              background: rowBg,
              border: `1px solid ${border}`,
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, color: sub, marginBottom: 2 }}>사용자 ID</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{userInfo.userId}</div>
            </div>
          )}

          <div style={{
            fontSize: 12, color: sub,
            background: isDark ? '#1a2a3a' : '#eff6ff',
            border: `1px solid ${isDark ? '#1d4ed8' : '#bfdbfe'}`,
            borderRadius: 8, padding: '8px 12px',
            marginBottom: 12,
          }}>
            현재 로그인된 계정 정보입니다. 계정 변경은 로그아웃 후 다시 로그인하세요.
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'none',
              border: `1px solid ${isDark ? '#ef4444' : '#fca5a5'}`,
              borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: '#ef4444',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = isDark ? '#1a0a0a' : '#fef2f2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <LogoutIcon style={{ fontSize: 18 }} />
            로그아웃
          </button>
        </Section>

        {/* 테마 설정 */}
        <Section icon={<PaletteIcon fontSize="small" />} title="테마 설정">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {THEME_OPTIONS.map((opt) => {
              const selected = themeMode === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  style={{
                    padding: '12px 6px',
                    borderRadius: 12,
                    border: `2px solid ${selected ? '#3b82f6' : border}`,
                    background: selected
                      ? (isDark ? '#1d3a6e' : '#eff6ff')
                      : (isDark ? '#0f172a' : '#f8fafc'),
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ color: selected ? '#3b82f6' : sub, display: 'flex' }}>
                    {opt.value === 'light'  ? <LightModeIcon fontSize="small" /> :
                     opt.value === 'dark'   ? <DarkModeIcon fontSize="small" /> :
                                              <SystemIcon fontSize="small" />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: selected ? '#3b82f6' : text }}>
                    {opt.label}
                  </span>
                  <span style={{ fontSize: 10, color: sub }}>{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 개인정보 설정 */}
        <Section icon={<SecurityIcon fontSize="small" />} title="개인정보 설정">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: text, marginBottom: 2 }}>
                개인정보 수집·이용 동의
              </div>
              <div style={{ fontSize: 11, color: sub }}>
                서비스 이용을 위해 동의가 필요합니다
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, fontWeight: 600,
              color: privacyAgreed ? '#10b981' : '#ef4444',
              background: privacyAgreed ? (isDark ? '#052e16' : '#f0fdf4') : (isDark ? '#1a0a0a' : '#fef2f2'),
              border: `1px solid ${privacyAgreed ? '#86efac' : '#fca5a5'}`,
              borderRadius: 9999, padding: '3px 10px',
            }}>
              {privacyAgreed
                ? <><CheckCircleIcon style={{ fontSize: 13 }} />동의함</>
                : <><CancelIcon style={{ fontSize: 13 }} />미동의</>
              }
            </div>
          </div>

          <button
            onClick={() => setPrivacyDialogOpen(true)}
            style={{
              width: '100%', height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'none',
              border: `1px solid ${border}`,
              borderRadius: 10, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: text,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = rowBg)}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <DescriptionIcon style={{ fontSize: 17 }} />
            개인정보 수집·이용 동의서 보기
          </button>
        </Section>

        {/* 앱 정보 */}
        <Section icon={<InfoIcon fontSize="small" />} title="앱 정보">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {INFO_ROWS.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px',
                  background: i % 2 === 0 ? rowBg : 'none',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 13, color: sub }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: text }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* 개인정보 동의서 다이얼로그 */}
      {userInfo && (
        <PrivacyAgreementDialog
          open={privacyDialogOpen}
          userId={userInfo.userId}
          onAgreed={async () => {
            setPrivacyDialogOpen(false);
            await loadPrivacyStatus();
          }}
          onClose={() => setPrivacyDialogOpen(false)}
          required={false}
          showDisagreeButton={false}
          showAgreeButton={!privacyAgreed}
          showCancelButton={!privacyAgreed}
        />
      )}
    </MobileMainLayout>
  );
}
