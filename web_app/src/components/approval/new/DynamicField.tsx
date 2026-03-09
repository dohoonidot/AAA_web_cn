import { memo } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import type { FormField } from '../types/formSchema';

interface DynamicFieldProps {
  field: FormField;
  value: string;
  onChange: (key: string, value: string) => void;
  isDark?: boolean;
  computedValue?: string;
}

function formatCurrency(value: string): string {
  const num = Number(value.replace(/,/g, ''));
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('ko-KR');
}

const DynamicField = memo(function DynamicField({
  field,
  value,
  onChange,
  isDark = false,
  computedValue,
}: DynamicFieldProps) {
  const displayValue = field.type === 'readonly' ? (computedValue ?? value) : value;
  const fieldText = isDark ? '#F8FAFC' : '#1A1D1F';
  const fieldBg = isDark ? 'rgba(71,85,105,0.52)' : '#FFFFFF';

  const fieldSx = {
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
  };

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

  const colSpan = field.colSpan === 3 ? 'span 3' : field.colSpan === 2 ? 'span 2' : 'span 1';

  const handleValueChange = (newValue: string) => {
    if (field.type === 'currency') {
      onChange(field.key, newValue.replace(/,/g, ''));
      return;
    }
    onChange(field.key, newValue);
  };

  const renderField = () => {
    if (field.type === 'readonly') {
      const raw = displayValue || '0';
      const formatted = field.unit
        ? `${Number(raw.replace(/,/g, '') || 0).toLocaleString('ko-KR')} ${field.unit}`
        : displayValue || '-';
      return <Box sx={readonlyStyle}>{formatted}</Box>;
    }

    if (field.type === 'info') {
      return <Box sx={readonlyStyle}>{field.defaultValue || '-'}</Box>;
    }

    if (field.type === 'select') {
      return (
        <TextField
          fullWidth
          select
          size="small"
          label={field.label}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          sx={fieldSx}
        >
          <MenuItem value="">{field.placeholder ?? '선택'}</MenuItem>
          {field.options?.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    if (field.type === 'textarea') {
      return (
        <TextField
          fullWidth
          multiline
          rows={field.rows ?? 3}
          size="small"
          label={field.label}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          sx={fieldSx}
        />
      );
    }

    if (field.type === 'currency') {
      return (
        <TextField
          fullWidth
          size="small"
          label={field.label}
          placeholder={field.placeholder ?? '0'}
          value={formatCurrency(value)}
          onChange={(e) => handleValueChange(e.target.value)}
          inputProps={{ inputMode: 'numeric' }}
          helperText={field.unit ? `단위: ${field.unit}` : undefined}
          sx={fieldSx}
        />
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        required={field.required}
        InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
        helperText={field.unit ? `단위: ${field.unit}` : undefined}
        sx={fieldSx}
      />
    );
  };

  return (
    <Box sx={{ gridColumn: colSpan }}>
      {(field.type === 'readonly' || field.type === 'info') && (
        <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75, color: isDark ? '#A0AEC0' : '#111827' }}>
          {field.label}
          {field.required ? <Box component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Box> : null}
        </Typography>
      )}
      {renderField()}
    </Box>
  );
});

export default DynamicField;
