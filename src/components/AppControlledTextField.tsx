import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import {
  TextField,
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { SxProps } from '@mui/system'

interface ControlledTextFieldProps {
  name: string
  control: Control<any>
  errors?: FieldErrors
  label: string
  placeholder?: string
  sx?: SxProps
  type?: 'text' | 'password' | 'number'
  required?: boolean
}

const ControlledTextField = ({
  name,
  control,
  errors,
  label,
  placeholder,
  sx = {},
  type = 'text',
  required = false,
}: ControlledTextFieldProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          error={!!errors?.[name]?.message}
          fullWidth
          variant='outlined'
        >
          <InputLabel shrink htmlFor={name} sx={{ fontSize: '20px' }}>
            {t(label)}
            {required && (
              <span style={{ color: 'red', marginBlockStart: '4px' }}>*</span>
            )}
          </InputLabel>
          <TextField
            required={required}
            type={type}
            {...field}
            id={name}
            error={!!errors?.[name]?.message}
            variant='outlined'
            placeholder={placeholder ? t(placeholder) : ''}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                },
                'label + &': {
                  marginTop: theme.spacing(3),
                },
              },
              ...sx,
            }}
          />
          {!errors?.[name]?.message && (
            <FormHelperText margin='dense'> </FormHelperText>
          )}
          {errors?.[name]?.message && (
            <FormHelperText margin='dense'>
              {errors[name]?.message as string}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

export default ControlledTextField
