import { FormControl, MenuItem, Select, useTheme, type SxProps, FormHelperText, Box, Typography, Skeleton } from '@mui/material';
import { Controller } from 'react-hook-form';

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
  loading?: boolean;
  disabled?: boolean;
}

export default function AppControlledSelect({
  name,
  control,
  errors,
  label,
  options,
  required = false,
  sx,
  loading = false,
  disabled = false,
}: AppControlledSelectProps) {
  const theme = useTheme();

  return (
    <Box sx={{ pt: 3, mt: -1, position: 'relative' }}>
      <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
        {label ?? ""}
        {required && (
          <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
        )}
      </Typography>
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
            {loading ? (
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '20px' }} />
            ) : (
              <Select
                {...field}
                displayEmpty
                disabled={disabled}
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
            )}
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
    </Box>
  );
} 