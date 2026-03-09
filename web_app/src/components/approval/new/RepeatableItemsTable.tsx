import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputBase,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { CustomItemEntry, RepeatableColumn, RepeatableSection } from '../types/formSchema';

interface ItemRow {
  id: string;
  [key: string]: string;
}

interface RepeatableItemsTableProps {
  section: RepeatableSection;
  isDark?: boolean;
  onChange?: (data: {
    columns: RepeatableColumn[];
    rows: Array<Record<string, string>>;
    customItems: CustomItemEntry[];
  }) => void;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function createEmptyRow(columns: RepeatableColumn[]): ItemRow {
  const row: ItemRow = { id: genId() };
  columns.forEach((col) => {
    row[col.key] = '';
  });
  return row;
}

function formatCurrency(val: string): string {
  const n = Number(val.replace(/,/g, ''));
  if (Number.isNaN(n) || val === '') return '';
  return n.toLocaleString('ko-KR');
}

function computeValue(col: RepeatableSection['columns'][number], row: ItemRow): string {
  if (col.type !== 'readonly' || !col.computeFrom) return row[col.key] ?? '';
  const [aKey, bKey] = col.computeFrom;
  const a = Number((row[aKey] ?? '').replace(/,/g, ''));
  const b = Number((row[bKey] ?? '').replace(/,/g, ''));
  if (Number.isNaN(a) || Number.isNaN(b)) return '0';
  return String(a * b);
}

export default function RepeatableItemsTable({ section, isDark = false, onChange }: RepeatableItemsTableProps) {
  const minRows = section.minRows ?? 1;
  const [columns, setColumns] = useState<RepeatableColumn[]>(section.columns);
  const [rows, setRows] = useState<ItemRow[]>(() => Array.from({ length: minRows }, () => createEmptyRow(section.columns)));
  const [customItems, setCustomItems] = useState<CustomItemEntry[]>([]);
  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnType, setNewColumnType] = useState<RepeatableColumn['type']>('text');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const onChangeRef = useRef(onChange);
  const emitTimerRef = useRef<number | null>(null);

  const cellBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.20)';
  const headerBg = isDark ? 'rgba(148,163,184,0.16)' : '#E9EEF5';
  const firstColBg = isDark ? 'rgba(148,163,184,0.12)' : '#F1F5F9';
  const totalRowBg = isDark ? 'rgba(148,163,184,0.10)' : 'rgba(248,250,252,0.95)';
  const fieldText = isDark ? '#F1F5F9' : '#1A1D1F';
  const inputBg = isDark ? 'rgba(71,85,105,0.52)' : '#FFFFFF';
  const PRIMARY_COLOR = '#475569';
  const primarySoft = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)';
  const controlFieldSx = {
    '& .MuiInputLabel-root': {
      color: isDark ? '#CBD5E1' : '#475569',
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: inputBg,
      '& .MuiInputBase-input, & .MuiSelect-select': {
        color: fieldText,
        WebkitTextFillColor: fieldText,
      },
      '& input:-webkit-autofill': {
        WebkitTextFillColor: fieldText,
        caretColor: fieldText,
        WebkitBoxShadow: `0 0 0 100px ${inputBg} inset`,
        transition: 'background-color 9999s ease-out 0s',
      },
    },
  };

  const sectionColumnsSignature = useMemo(
    () => section.columns.map((col) => `${col.key}:${col.label}:${col.type}`).join('|'),
    [section.columns]
  );

  useEffect(() => {
    setColumns(section.columns);
    setRows(Array.from({ length: minRows }, () => createEmptyRow(section.columns)));
    setCustomItems([]);
  }, [section.id, sectionColumnsSignature, minRows, section.columns]);

  const handleChange = useCallback((rowId: string, colKey: string, raw: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return { ...r, [colKey]: raw.replace(/,/g, '') };
      })
    );
  }, []);

  const addRow = () => setRows((prev) => [...prev, createEmptyRow(columns)]);

  const removeRow = (rowId: string) => {
    setRows((prev) => {
      if (prev.length <= minRows) return prev;
      return prev.filter((r) => r.id !== rowId);
    });
  };

  const addColumn = () => {
    const label = newColumnLabel.trim();
    if (!label) return;
    const key = `custom_col_${genId()}`;
    const nextCol: RepeatableColumn = {
      key,
      label,
      type: newColumnType,
      align: newColumnType === 'currency' ? 'right' : 'left',
    };
    setColumns((prev) => [...prev, nextCol]);
    setRows((prev) => prev.map((row) => ({ ...row, [key]: '' })));
    setNewColumnLabel('');
    setNewColumnType('text');
  };

  const removeColumn = (key: string) => {
    setColumns((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((col) => col.key !== key);
      return next.length > 0 ? next : prev;
    });
    setRows((prev) => prev.map((row) => {
      const next = { ...row };
      delete next[key];
      return next;
    }));
  };

  const addCustomItem = () => {
    const label = newItemLabel.trim();
    if (!label) return;
    setCustomItems((prev) => [...prev, { id: genId(), label, value: newItemValue }]);
    setNewItemLabel('');
    setNewItemValue('');
  };

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCustomItem = (id: string, key: 'label' | 'value', value: string) => {
    setCustomItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const totalMap = useMemo(() => {
    const totals: Record<string, number> = {};
    columns.forEach((col) => {
      if (col.type === 'readonly' && col.computeFrom) {
        totals[col.key] = rows.reduce((sum, row) => sum + Number(computeValue(col, row) || 0), 0);
      }
    });
    return totals;
  }, [rows, columns]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!onChangeRef.current) return;
    if (emitTimerRef.current) {
      window.clearTimeout(emitTimerRef.current);
    }
    emitTimerRef.current = window.setTimeout(() => {
      const serializedRows = rows.map((row) => {
        const rest: Record<string, string> = {};
        Object.keys(row).forEach((key) => {
          if (key === 'id') return;
          rest[key] = row[key];
        });
        return rest;
      });
      onChangeRef.current?.({ columns, rows: serializedRows, customItems });
    }, 120);
    return () => {
      if (emitTimerRef.current) {
        window.clearTimeout(emitTimerRef.current);
      }
    };
  }, [columns, rows, customItems]);

  const totalRowExists = Object.keys(totalMap).length > 0;

  return (
    <Box>
      <Box sx={{ border: `1px solid ${cellBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    textAlign: 'center',
                    borderBottom: `1px solid ${cellBorder}`,
                    borderRight: `1px solid ${cellBorder}`,
                    background: headerBg,
                    whiteSpace: 'nowrap',
                    py: 1,
                    px: 1.25,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                    <Box component="span">{col.label}</Box>
                    <IconButton size="small" onClick={() => removeColumn(col.key)} sx={{ color: '#94a3b8', p: 0.25 }}>
                      <DeleteOutlineIcon fontSize="inherit" />
                    </IconButton>
                  </Box>
                </TableCell>
              ))}
              <TableCell
                sx={{
                  width: 40,
                  borderBottom: `1px solid ${cellBorder}`,
                  background: headerBg,
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col, colIndex) => {
                  if (col.type === 'readonly') {
                    const computed = computeValue(col, row);
                    return (
                      <TableCell
                        key={col.key}
                        sx={{
                          px: 1.25,
                          py: 1,
                          borderBottom: `1px solid ${cellBorder}`,
                          borderRight: `1px solid ${cellBorder}`,
                          color: isDark ? '#94a3b8' : '#475569',
                          fontSize: 13,
                          textAlign: 'right',
                          background: colIndex === 0
                            ? firstColBg
                            : (isDark ? 'rgba(148,163,184,0.04)' : 'rgba(241,245,249,0.6)'),
                        }}
                      >
                        {computed ? Number(computed).toLocaleString('ko-KR') : '-'}
                      </TableCell>
                    );
                  }

                  const value = row[col.key] ?? '';
                  const display = col.type === 'currency' ? formatCurrency(value) : value;
                  const inputType = col.type === 'number' ? 'number' : 'text';

                  return (
                    <TableCell
                      key={col.key}
                      sx={{ p: 0, borderBottom: `1px solid ${cellBorder}`, borderRight: `1px solid ${cellBorder}` }}
                    >
                      <InputBase
                        type={inputType}
                        value={display}
                        placeholder={col.placeholder ?? ''}
                        onChange={(e) => handleChange(row.id, col.key, e.target.value)}
                        sx={{
                          px: 1.25,
                          py: 1,
                          fontSize: 13,
                          color: fieldText,
                          backgroundColor: colIndex === 0 ? firstColBg : inputBg,
                          width: '100%',
                          '& input': {
                            textAlign: col.align ?? 'left',
                            color: fieldText,
                            WebkitTextFillColor: fieldText,
                          },
                          '& input:-webkit-autofill': {
                            WebkitTextFillColor: fieldText,
                            caretColor: fieldText,
                            WebkitBoxShadow: `0 0 0 100px ${colIndex === 0 ? firstColBg : inputBg} inset`,
                            transition: 'background-color 9999s ease-out 0s',
                          },
                        }}
                        inputProps={{ inputMode: col.type === 'currency' || col.type === 'number' ? 'numeric' : undefined }}
                      />
                    </TableCell>
                  );
                })}
                <TableCell sx={{ p: 0.25, borderBottom: `1px solid ${cellBorder}`, textAlign: 'center' }}>
                  {rows.length > minRows && (
                    <IconButton size="small" onClick={() => removeRow(row.id)} sx={{ color: '#ef4444' }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {totalRowExists && (
              <TableRow>
                {columns.map((col, index) => {
                  if (col.type === 'readonly' && col.computeFrom) {
                    return (
                      <TableCell
                        key={col.key}
                        sx={{
                          px: 1.25,
                          py: 1,
                          borderBottom: `1px solid ${cellBorder}`,
                          borderRight: `1px solid ${cellBorder}`,
                          background: index === 0 ? firstColBg : totalRowBg,
                          fontWeight: 700,
                          color: isDark ? '#e2e8f0' : '#1e293b',
                          fontSize: 13,
                          textAlign: 'right',
                        }}
                      >
                        {totalMap[col.key]?.toLocaleString('ko-KR') ?? '-'}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell
                      key={col.key}
                      sx={{
                        py: 1,
                        px: 1.25,
                        borderBottom: `1px solid ${cellBorder}`,
                        borderRight: `1px solid ${cellBorder}`,
                        background: index === 0 ? firstColBg : totalRowBg,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isDark ? '#94a3b8' : '#475569',
                        textAlign: 'center',
                      }}
                    >
                      {index === 0 ? '합 계' : ''}
                    </TableCell>
                  );
                })}
                <TableCell sx={{ background: totalRowBg, borderBottom: `1px solid ${cellBorder}` }} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        {section.note ? (
          <Typography sx={{ fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>{section.note}</Typography>
        ) : null}
        <Box sx={{ ml: 'auto', mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="새 컬럼명"
            value={newColumnLabel}
            onChange={(e) => setNewColumnLabel(e.target.value)}
            sx={{ minWidth: 140, ...controlFieldSx }}
          />
          <TextField
            select
            size="small"
            value={newColumnType}
            onChange={(e) => setNewColumnType(e.target.value as RepeatableColumn['type'])}
            sx={{ minWidth: 120, ...controlFieldSx }}
          >
            <MenuItem value="text">텍스트</MenuItem>
            <MenuItem value="number">숫자</MenuItem>
            <MenuItem value="currency">금액</MenuItem>
            <MenuItem value="textarea">메모</MenuItem>
          </TextField>
          <Button
            size="small"
            onClick={addColumn}
            startIcon={<AddIcon fontSize="small" />}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              borderRadius: '12px',
              color: PRIMARY_COLOR,
              border: `1px solid ${isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.20)'}`,
              background: primarySoft,
            }}
          >
            열 추가
          </Button>
        </Box>
        <Button
          size="small"
          onClick={addRow}
          sx={{
            mt: 1,
            fontSize: 12,
            fontWeight: 600,
            borderRadius: '12px',
            color: PRIMARY_COLOR,
            border: `1px solid ${isDark ? 'rgba(148,163,184,0.24)' : 'rgba(148,163,184,0.20)'}`,
            background: primarySoft,
            '&:hover': {
              background: isDark ? 'rgba(148,163,184,0.20)' : 'rgba(148,163,184,0.16)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          + 항목 추가
        </Button>
      </Box>

      <Box sx={{ mt: 2, borderTop: `1px dashed ${cellBorder}`, pt: 1.5 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', mb: 1 }}>
          추가 입력 항목
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="항목명"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            sx={{ minWidth: 180, ...controlFieldSx }}
          />
          <TextField
            size="small"
            label="값"
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            sx={{ flex: 1, minWidth: 220, ...controlFieldSx }}
          />
          <Button size="small" variant="outlined" onClick={addCustomItem} sx={{ borderRadius: '10px' }}>
            항목 추가
          </Button>
        </Box>
        {customItems.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              value={item.label}
              onChange={(e) => updateCustomItem(item.id, 'label', e.target.value)}
              sx={{ minWidth: 180, ...controlFieldSx }}
            />
            <TextField
              size="small"
              value={item.value}
              onChange={(e) => updateCustomItem(item.id, 'value', e.target.value)}
              sx={{ flex: 1, ...controlFieldSx }}
            />
            <IconButton size="small" onClick={() => removeCustomItem(item.id)} sx={{ color: '#ef4444' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
