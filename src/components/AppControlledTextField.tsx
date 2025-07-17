import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import {
  TextField,
  FormControl,
  InputLabel,
  FormHelperText,
  useTheme,
  type TextFieldProps,
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
  slotProps?: TextFieldProps['slotProps']
  multiline?: boolean
  minRows?: number
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
  slotProps,
  multiline = false,
  minRows = 1,
}: ControlledTextFieldProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  // Локальная функция get для вложенных путей
  const get = (obj: any, path: string) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj)

  const errorObj = get(errors, name)
  const errorMessage = errorObj?.message


  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl
          error={!!errorMessage}
          fullWidth
          variant='outlined'
          size='small'
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
            multiline={multiline}
            minRows={minRows}
            {...field}
            id={name}
            error={!!errorMessage}
            variant='outlined'
            placeholder={placeholder ? t(placeholder) : ''}
            slotProps={slotProps}
            size='small'
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                },
                'label + &': {
                  marginTop: theme.spacing(2),
                },
              },
              ...sx,
            }}
          />
          {!errorMessage && (
            <FormHelperText margin='dense'> </FormHelperText>
          )}
          {errorMessage && (
            <FormHelperText margin='dense'>
              {errorMessage}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  )
}

export default ControlledTextField
