import { FormControl, InputLabel, MenuItem, Select, useTheme, type SxProps, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Option {
  value: string | number;
  label: string;
}

interface AppControlledSelectProps {
  name: string;
  control: any;
  errors?: any;
  label: string;
  options: Option[];
  required?: boolean;
  sx?: SxProps;
}

export default function AppControlledSelect({
  name,
  control,
  errors,
  label,
  options,
  required = false,
  sx,
}: AppControlledSelectProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <InputLabel sx={{ fontSize: '15px', mb: .5, ml: 2, mt: -1 }}>
        {t(label)}
        {required && (
          <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
        )}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <FormControl
            variant='outlined'
            size='small'
            fullWidth
            error={!!errors?.[name]}
            sx={{ ...sx }}
          >
            <Select
              {...field}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    boxShadow: '0px 0px 30px rgba(0, 0, 0, 1)',
                  },
                  'label + &': {
                    marginTop: theme.spacing(2),
                  },
                },
              }}
            >
              {options.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            {errors?.[name] && (
              <FormHelperText margin='dense'>
                {errors[name].message}
              </FormHelperText>
            )}
            {!errors?.[name] && (
              <FormHelperText margin='dense'> </FormHelperText>
            )}
          </FormControl>
        )}
      />
    </>
  );
} 