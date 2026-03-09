import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import leaveService from '../../services/leaveService';
import departmentService from '../../services/departmentService';
import './VacationCalendar.css';

interface AllEmployeeLeaveRecord {
  id: number;
  name: string;
  department: string;
  job_position: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  workdays_count: number;
  user_id: string;
  year: number;
}

interface ColorScheme {
  textColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textFieldBorderColor: string;
  [key: string]: string;
}

interface VacationCalendarProps {
  isDark: boolean;
  colorScheme: ColorScheme;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// ===== 로컬스토리지 캐시 헬퍼 (월 단위) =====
const cacheKey = (year: number, month: number) => `vc_leaves_${year}_${padDate(month + 1)}`;

function loadCache(year: number, month: number): AllEmployeeLeaveRecord[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(year, month));
    if (!raw) return null;
    const { leaves } = JSON.parse(raw);
    return Array.isArray(leaves) ? leaves : null;
  } catch {
    return null;
  }
}

function saveCache(year: number, month: number, leaves: AllEmployeeLeaveRecord[]) {
  try {
    localStorage.setItem(cacheKey(year, month), JSON.stringify({ leaves, cachedAt: new Date().toISOString() }));
  } catch { /* 스토리지 용량 초과 등 무시 */ }
}

// 6×7 그리드의 실제 표시 범위(시작일/종료일) 계산
function getGridDateRange(year: number, month: number): { start: string; end: string } {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=일, 6=토
  const gridStart = new Date(year, month, 1 - startOffset);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41); // 42칸 - 1

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${padDate(d.getMonth() + 1)}-${padDate(d.getDate())}`;
  return { start: fmt(gridStart), end: fmt(gridEnd) };
}

function getLeaveTagClass(leaveType: string): string {
  const t = leaveType ?? '';
  if (t.includes('연차') || t.includes('반차') || t.includes('annual') || t.toLowerCase().includes('annual')) return 'annual';
  if (t.includes('병가') || t.toLowerCase().includes('sick')) return 'sick';
  if (t.includes('경조') || t.includes('예비군') || t.includes('민방위') || t.includes('special') || t.toLowerCase().includes('special')) return 'special';
  return 'other';
}

function normalizeDate(raw: string): string {
  if (!raw) return '';
  if (raw.includes('T')) return raw.split('T')[0];
  if (raw.includes(' ')) return raw.split(' ')[0];
  return raw;
}

function dateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr;
}

function getCalendarCells(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells: Date[] = [];

  // 이전 달 채우기
  for (let i = 0; i < firstDay.getDay(); i++) {
    cells.push(new Date(year, month, -firstDay.getDay() + i + 1));
  }
  // 현재 달
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push(new Date(year, month, d));
  }
  // 다음 달 채우기 (6줄 고정)
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push(new Date(year, month + 1, i));
  }
  return cells;
}

function padDate(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${padDate(d.getMonth() + 1)}-${padDate(d.getDate())}`;
}

export default function VacationCalendar({ isDark }: VacationCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [allLeaves, setAllLeaves] = useState<AllEmployeeLeaveRecord[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deptFilter, setDeptFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('APPROVED');

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const MODAL_PAGE_SIZE = 50;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  // 월별 데이터 조회 (stale-while-revalidate)
  const fetchData = useCallback(async (year: number, month: number) => {
    setError(null);

    const cached = loadCache(year, month);
    if (cached) {
      setAllLeaves(cached);
      setRevalidating(true);
    } else {
      setLoading(true);
    }

    const { start, end } = getGridDateRange(year, month);

    try {
      const [depts, result] = await Promise.all([
        departmentService.getDepartmentList(),
        leaveService.getAllEmployeeLeaveHistory(year, start, end),
      ]);
      setDepartments(depts);

      const fresh = result.leaves ?? [];
      setAllLeaves(fresh);
      saveCache(year, month, fresh);
    } catch {
      if (!cached) setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setRevalidating(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchData]);

  // 클라이언트 필터 (부서/이름/상태) - 월 범위는 서버에서 처리
  const filteredLeaves = useMemo(() => {
    return allLeaves.filter((l) => {
      if (deptFilter && l.department !== deptFilter) return false;
      if (nameFilter && !l.name.includes(nameFilter)) return false;
      if (statusFilter && l.status !== statusFilter) return false;
      return true;
    });
  }, [allLeaves, deptFilter, nameFilter, statusFilter]);

  // 날짜별 휴가 맵
  const leavesByDate = useMemo(() => {
    const map = new Map<string, AllEmployeeLeaveRecord[]>();
    const cells = getCalendarCells(currentYear, currentMonth);
    cells.forEach((cell) => {
      const key = toDateKey(cell);
      const leaves = filteredLeaves.filter((l) =>
        dateInRange(key, normalizeDate(l.start_date), normalizeDate(l.end_date))
      );
      if (leaves.length > 0) map.set(key, leaves);
    });
    return map;
  }, [filteredLeaves, currentYear, currentMonth]);

  const cells = useMemo(() => getCalendarCells(currentYear, currentMonth), [currentYear, currentMonth]);

  // 월 이동
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    const now = new Date();
    const newYear = now.getFullYear();
    if (newYear !== currentYear) setCurrentYear(newYear);
    setCurrentMonth(now.getMonth());
  };

  const openModal = (dateKey: string) => {
    if (!leavesByDate.has(dateKey)) return;
    setSelectedDate(dateKey);
    setModalPage(1);
    setModalOpen(true);
  };

  const modalLeaves = selectedDate
    ? [...(leavesByDate.get(selectedDate) ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name, 'ko-KR')
      )
    : [];

  const todayKey = toDateKey(today);

  return (
    <div className={`vc-root${isDark ? ' dark' : ''}`}>
      {/* 필터 바 */}
      <div className="vc-filter-bar">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="">전체 부서</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="이름 검색"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">전체</option>
          <option value="APPROVED">승인</option>
          <option value="REQUESTED">요청</option>
        </select>
      </div>

      {/* 네비게이션 */}
      <div className="vc-nav">
        <div className="vc-nav-title-wrap" ref={pickerRef}>
          <button
            className="vc-nav-title-btn"
            onClick={() => { setPickerYear(currentYear); setPickerOpen((o) => !o); }}
          >
            {currentYear}년 {currentMonth + 1}월 ▾
          </button>

          {pickerOpen && (
            <div className="vc-picker">
              {/* 연도 선택 */}
              <div className="vc-picker-year-row">
                <button className="vc-picker-arrow" onClick={() => setPickerYear((y) => y - 1)}>‹</button>
                <span className="vc-picker-year">{pickerYear}년</span>
                <button className="vc-picker-arrow" onClick={() => setPickerYear((y) => y + 1)}>›</button>
              </div>
              {/* 월 그리드 */}
              <div className="vc-picker-months">
                {Array.from({ length: 12 }, (_, i) => i).map((m) => {
                  const isSelected = pickerYear === currentYear && m === currentMonth;
                  return (
                    <button
                      key={m}
                      className={`vc-picker-month-btn${isSelected ? ' selected' : ''}`}
                      onClick={() => {
                        setCurrentYear(pickerYear);
                        setCurrentMonth(m);
                        setPickerOpen(false);
                      }}
                    >
                      {m + 1}월
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="vc-nav-controls">
          {revalidating && <span className="vc-revalidating">↻</span>}
          <button className="vc-nav-btn" onClick={prevMonth} title="이전 달">‹</button>
          <button className="vc-today-btn" onClick={goToday}>오늘</button>
          <button className="vc-nav-btn" onClick={nextMonth} title="다음 달">›</button>
        </div>
      </div>

      {/* 캘린더 */}
      {loading ? (
        <div className="vc-state">
          <CircularProgress size={32} />
        </div>
      ) : error ? (
        <div className="vc-state">{error}</div>
      ) : (
        <div className="vc-calendar">
          {/* 요일 헤더 */}
          <div className="vc-weekday-row">
            {DAYS_OF_WEEK.map((d, i) => (
              <div
                key={d}
                className={`vc-weekday${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="vc-grid">
            {cells.map((cell, idx) => {
              const isCurrentMonth = cell.getMonth() === currentMonth;
              const dateKey = toDateKey(cell);
              const dayLeaves = leavesByDate.get(dateKey) ?? [];
              const isToday = dateKey === todayKey;
              const dow = cell.getDay();

              let cellClass = 'vc-cell';
              if (!isCurrentMonth) cellClass += ' other-month';
              if (isToday) cellClass += ' today';
              if (dayLeaves.length > 0) cellClass += ' has-leaves';

              let dateClass = 'vc-date-num';
              if (!isCurrentMonth) dateClass += ' other-month';
              else if (dow === 0) dateClass += ' sun';
              else if (dow === 6) dateClass += ' sat';
              if (isToday) dateClass += ' today-num';

              const MAX_TAGS = 3;
              const visibleLeaves = dayLeaves.slice(0, MAX_TAGS);
              const extra = dayLeaves.length - MAX_TAGS;

              return (
                <div
                  key={idx}
                  className={cellClass}
                  onClick={() => dayLeaves.length > 0 && openModal(dateKey)}
                >
                  <span className={dateClass}>{cell.getDate()}</span>
                  {visibleLeaves.map((l) => (
                    <span
                      key={`${l.id}-${dateKey}`}
                      className={`vc-tag ${getLeaveTagClass(l.leave_type)}`}
                      title={`${l.name} · ${l.department} (${l.leave_type})`}
                    >
                      {l.name} <span className="vc-tag-dept">{l.department}</span>
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="vc-more">+{extra}건 더보기</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {modalOpen && selectedDate && (() => {
        const totalCount = modalLeaves.length;
        const totalPages = Math.ceil(totalCount / MODAL_PAGE_SIZE);
        const pageLeaves = modalLeaves.slice((modalPage - 1) * MODAL_PAGE_SIZE, modalPage * MODAL_PAGE_SIZE);
        return (
          <div className={`vc-modal-backdrop${isDark ? ' dark' : ''}`} onClick={() => setModalOpen(false)}>
            <div className="vc-modal" onClick={(e) => e.stopPropagation()}>
              {/* 헤더 */}
              <div className="vc-modal-header">
                <div className="vc-modal-header-left">
                  <span className="vc-modal-title">{selectedDate} 휴가자</span>
                  <span className="vc-modal-count">{totalCount}명</span>
                </div>
                <button className="vc-modal-close" onClick={() => setModalOpen(false)}>×</button>
              </div>

              {/* 목록 (스크롤바 표시) */}
              <div className="vc-modal-body">
                {pageLeaves.map((l, idx) => {
                  const globalIdx = (modalPage - 1) * MODAL_PAGE_SIZE + idx + 1;
                  return (
                    <div key={l.id} className="vc-modal-item">
                      <span className="vc-modal-item-num">{globalIdx}</span>
                      <div className="vc-modal-item-content">
                        <div className="vc-modal-item-row1">
                          <span className="vc-modal-item-name">{l.name}</span>
                          <span className="vc-modal-item-dept">{l.department} · {l.job_position}</span>
                        </div>
                        <div className="vc-modal-item-meta">
                          <span className={`vc-tag ${getLeaveTagClass(l.leave_type)}`}>{l.leave_type}</span>
                          <span className="vc-modal-item-date">
                            {normalizeDate(l.start_date)} ~ {normalizeDate(l.end_date)}
                          </span>
                          <span className="vc-modal-item-days">{l.workdays_count}일</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="vc-modal-pagination">
                  <button
                    className="vc-modal-page-btn"
                    onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                    disabled={modalPage === 1}
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`vc-modal-page-btn${p === modalPage ? ' active' : ''}`}
                      onClick={() => setModalPage(p)}
                    >{p}</button>
                  ))}
                  <button
                    className="vc-modal-page-btn"
                    onClick={() => setModalPage((p) => Math.min(totalPages, p + 1))}
                    disabled={modalPage === totalPages}
                  >›</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
