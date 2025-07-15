import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18next from '../i18next';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, useTheme } from '@mui/material';
import { Typography } from '@mui/material';


interface IProps {
  name: string;
  control: Control<any>;
  label?: string;
  errors?: FieldErrors;
  required?: boolean;
  [key: string]: any;
}

export function AppControlledDatePicker({
  name,
  control,
  label,
  errors,
  required = false,
  ...rest
}: IProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ pt: 3, mt: -1, position: 'relative', mb: 3 }}>
      <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
        {label ?? ""}
        {required && (
          <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
        )}
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={i18next.language}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <DatePicker
              {...rest}
              value={field.value ? dayjs(field.value) : null}
              onChange={date => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
              slotProps={{
                field: {
                  clearable: true,
                  onClear: () => field.onChange(''),
                },
                textField: {
                  size: 'small',
                  variant: 'outlined',
                  fullWidth: true,
                  error: !!errors?.[name],
                  helperText: typeof errors?.[name]?.message === 'string' ? errors[name]?.message : undefined,
                  required,
                  sx: {
                    '&.MuiPickersTextField-root fieldset': {
                      borderRadius: '24px',
                    },
                    '&.MuiPickersTextField-root.Mui-focused fieldset': {
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                    },
                  },
                  placeholder: t('date', { ns: 'search' }),
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
} 