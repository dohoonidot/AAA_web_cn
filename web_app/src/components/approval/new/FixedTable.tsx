import { Box, MenuItem, Table, TableBody, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { FixedTableSection } from '../types/formSchema';

interface FixedTableProps {
  section: FixedTableSection;
  isDark?: boolean;
  onChange?: (values: Record<string, string>) => void;
}

type RowState = Record<string, string>;
type Action = { key: string; value: string };

function reducer(state: RowState, action: Action): RowState {
  if (state[action.key] === action.value) return state;
  return { ...state, [action.key]: action.value };
}

function buildInitial(section: FixedTableSection): RowState {
  const initial: RowState = {};
  section.rows.forEach((row) => {
    initial[row.key] = row.defaultValue ?? '';
  });
  return initial;
}

export default function FixedTable({ section, isDark = false, onChange }: FixedTableProps) {
  const [values, dispatch] = useReducer(reducer, section, buildInitial);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!onChangeRef.current) return;
    onChangeRef.current(values);
  }, [values]);

  const cellBorder = isDark ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.20)';
  const labelColBg = isDark ? 'rgba(148,163,184,0.16)' : '#E9EEF5';
  const fieldText = isDark ? '#F8FAFC' : '#1A1D1F';
  const fieldBg = isDark ? 'rgba(71,85,105,0.52)' : '#FFFFFF';

  const fieldSx = useMemo(
    () => ({
      '& .MuiInputLabel-root': {
        color: isDark ? '#CBD5E1' : '#475569',
        fontSize: 12,
        fontWeight: 600,
      },
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: fieldBg,
        fontSize: 13,
        '& fieldset': { borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)' },
        '&.Mui-focused fieldset': {
          borderColor: isDark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.22)',
        },
        '& .MuiInputBase-input, & .MuiInputBase-inputMultiline, & .MuiSelect-select': {
          color: fieldText,
          WebkitTextFillColor: fieldText,
        },
        '& input:-webkit-autofill, & textarea:-webkit-autofill': {
          WebkitTextFillColor: fieldText,
          caretColor: fieldText,
          WebkitBoxShadow: `0 0 0 100px ${fieldBg} inset`,
          transition: 'background-color 9999s ease-out 0s',
        },
      },
    }),
    [fieldBg, fieldText, isDark]
  );

  const readonlyStyle = {
    px: 1.5,
    py: 1,
    borderRadius: '12px',
    border: `1px solid ${isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.22)'}`,
    background: isDark ? 'rgba(148,163,184,0.07)' : 'rgba(248,250,252,0.92)',
    color: isDark ? '#64748b' : '#475569',
    fontSize: 13,
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Box>
      <Box sx={{ border: `1px solid ${cellBorder}`, borderRadius: '16px', overflow: 'hidden' }}>
        <Table size="small">
          <TableBody>
            {section.rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell
                  sx={{
                    width: row.labelWidth ?? '32%',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDark ? '#94a3b8' : '#475569',
                    borderBottom: `1px solid ${cellBorder}`,
                    borderRight: `1px solid ${cellBorder}`,
                    background: labelColBg,
                    py: 1,
                    px: 1.5,
                  }}
                >
                  {row.label}
                  {row.required ? <Box component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Box> : null}
                </TableCell>
                <TableCell
                  sx={{ borderBottom: `1px solid ${cellBorder}`, py: 1, px: 1.5, verticalAlign: 'top' }}
                >
                  {row.type === 'readonly' || row.type === 'info' ? (
                    <Box sx={readonlyStyle}>{row.type === 'info' ? row.defaultValue || '-' : values[row.key] || '-'}</Box>
                  ) : row.type === 'select' ? (
                    <TextField
                      fullWidth
                      select
                      size="small"
                      value={values[row.key] ?? ''}
                      onChange={(e) => dispatch({ key: row.key, value: e.target.value })}
                      sx={fieldSx}
                    >
                      <MenuItem value="">{row.placeholder ?? '선택'}</MenuItem>
                      {row.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      type={row.type === 'date' ? 'date' : row.type === 'number' ? 'number' : 'text'}
                      multiline={row.type === 'textarea'}
                      rows={row.type === 'textarea' ? row.rows ?? 3 : undefined}
                      placeholder={row.placeholder}
                      value={values[row.key] ?? ''}
                      onChange={(e) => dispatch({ key: row.key, value: e.target.value })}
                      sx={fieldSx}
                      InputLabelProps={row.type === 'date' ? { shrink: true } : undefined}
                    />
                  )}
                  {row.note ? (
                    <Typography sx={{ mt: 0.75, fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>
                      {row.note}
                    </Typography>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {section.note ? (
        <Typography sx={{ mt: 1, fontSize: 11, color: isDark ? '#64748b' : '#94a3b8' }}>{section.note}</Typography>
      ) : null}
    </Box>
  );
}
