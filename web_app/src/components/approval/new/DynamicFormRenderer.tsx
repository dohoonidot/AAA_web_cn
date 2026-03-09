import { memo, useReducer, useCallback, useMemo, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type {
  ApprovalFormData,
  ApprovalFormSchema,
  FixedTableSection,
  FormSection,
  RepeatableSection,
  RepeatableSectionData,
} from '../types/formSchema';
import ApprovalCard from './ApprovalCard';
import DynamicField from './DynamicField';
import RepeatableItemsTable from './RepeatableItemsTable';
import FixedTable from './FixedTable';

interface DynamicFormRendererProps {
  schema: ApprovalFormSchema;
  isDark?: boolean;
  onDataChange?: (data: ApprovalFormData) => void;
}

type FormAction = { key: string; value: string };

function formReducer(state: Record<string, string>, action: FormAction): Record<string, string> {
  if (state[action.key] === action.value) return state;
  return { ...state, [action.key]: action.value };
}

function buildInitialState(schema: ApprovalFormSchema): Record<string, string> {
  const initial: Record<string, string> = {};
  schema.sections.forEach((section) => {
    if (section.type === 'repeatable') return;
    if (section.type === 'fixed-table') {
      (section as FixedTableSection).rows.forEach((row) => {
        initial[row.key] = row.defaultValue ?? '';
      });
      return;
    }
    (section as FormSection).fields.forEach((field) => {
      initial[field.key] = field.defaultValue ?? '';
    });
  });
  return initial;
}

function computeReadonlyValues(schema: ApprovalFormSchema, data: Record<string, string>): Record<string, string> {
  const computed: Record<string, string> = {};

  schema.sections.forEach((section) => {
    if (section.type === 'repeatable' || section.type === 'fixed-table') return;
    const fields = (section as FormSection).fields;
    const currencyKeys = fields.filter((f) => f.type === 'currency').map((f) => f.key);

    fields.forEach((field) => {
      if (field.type !== 'readonly') return;
      if (field.key === 'totalAmount' && data['quantity'] && data['unitPrice']) {
        const qty = Number(data['quantity'] || 0);
        const unit = Number(data['unitPrice'] || 0);
        computed[field.key] = String(qty * unit);
      } else if (field.key === 'totalExpense') {
        const sum = currencyKeys.reduce((acc, k) => acc + Number(data[k] || 0), 0);
        computed[field.key] = String(sum);
      }
    });
  });

  return computed;
}

function isSameByJson(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function DynamicFormRenderer({ schema, isDark = false, onDataChange }: DynamicFormRendererProps) {
  const [formData, dispatch] = useReducer(formReducer, schema, buildInitialState);
  const [fixedTableData, setFixedTableData] = useState<Record<string, Record<string, string>>>({});
  const [repeatableSectionData, setRepeatableSectionData] = useState<Record<string, RepeatableSectionData>>({});

  const handleChange = useCallback(
    (key: string, value: string) => {
      dispatch({ key, value });
    },
    []
  );

  const computedValues = useMemo(() => computeReadonlyValues(schema, formData), [schema, formData]);

  useEffect(() => {
    if (!onDataChange) return;
    onDataChange({
      fields: formData,
      fixedTables: fixedTableData,
      repeatableSections: repeatableSectionData,
    });
  }, [formData, fixedTableData, repeatableSectionData, onDataChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {schema.sections.map((section) => {
        if (section.type === 'repeatable') {
          return (
            <ApprovalCard key={section.id} title={section.title} isDark={isDark}>
              <RepeatableItemsTable
                section={section as RepeatableSection}
                isDark={isDark}
                onChange={(data) => {
                  setRepeatableSectionData((prev) => {
                    const current = prev[section.id];
                    if (isSameByJson(current, data)) return prev;
                    return { ...prev, [section.id]: data };
                  });
                }}
              />
            </ApprovalCard>
          );
        }

        if (section.type === 'fixed-table') {
          return (
            <ApprovalCard key={section.id} title={section.title} isDark={isDark}>
              <FixedTable
                section={section as FixedTableSection}
                isDark={isDark}
                onChange={(data) => {
                  setFixedTableData((prev) => {
                    const current = prev[section.id];
                    if (isSameByJson(current, data)) return prev;
                    return { ...prev, [section.id]: data };
                  });
                }}
              />
            </ApprovalCard>
          );
        }

        const normalSection = section as FormSection;
        return (
          <ApprovalCard key={normalSection.id} title={normalSection.title} isDark={isDark}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 2 }}>
              {normalSection.fields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  value={formData[field.key] ?? ''}
                  onChange={handleChange}
                  isDark={isDark}
                  computedValue={computedValues[field.key]}
                />
              ))}
            </Box>
          </ApprovalCard>
        );
      })}
    </Box>
  );
}

export default memo(DynamicFormRenderer);
