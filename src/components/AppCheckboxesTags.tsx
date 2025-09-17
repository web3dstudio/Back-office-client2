
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { FormControl, InputLabel, useTheme, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SxProps } from '@mui/system';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface AppCheckboxesTagsProps<T> {
  name: string;
  value: T[];
  onChange: (value: T[]) => void;
  options: T[];
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  label?: string;
  placeholder?: string;
  sx?: SxProps;
  loading?: boolean;
}

export default function AppCheckboxesTags<T = any>({
  name,
  value,
  onChange,
  options,
  getOptionLabel = (option: any) => option.title,
  isOptionEqualToValue,
  label,
  placeholder,
  sx,
  loading = false,
}: AppCheckboxesTagsProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Автоматически определяем функцию сравнения по id, если есть, иначе по ссылке
  const defaultIsOptionEqualToValue = (option: any, value: any) => {
    if (option && value && option.id !== undefined && value.id !== undefined) {
      return option.id === value.id;
    }
    return option === value;
  };

  return (
    <Autocomplete
      fullWidth
      loading={loading}
      multiple
      disableCloseOnSelect
      id={name}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue || defaultIsOptionEqualToValue}
      value={value || []}
      onChange={(_, value) => onChange(value)}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {getOptionLabel(option)}
          </li>
        );
      }}

      renderInput={(params) => (
        <FormControl
          fullWidth
          variant="standard"
          size="medium"
          sx={{
            // maxHeight: '40px',
            '& .MuiAutocomplete-inputRoot': {
              // maxHeight: '40px',
              overflow: 'hidden'
            },
            '& .MuiChip-root': {
              height: '22px',
              fontSize: '12px'
            },
            ...sx
          }}
        >
          <InputLabel
            shrink
            htmlFor={name}
            sx={{
              fontSize: '20px',
              position: 'absolute',
              top: '-6px',
              left: '14px',
              background: 'white',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {label && t(label)}
          </InputLabel>
          <TextField
            {...params}
            placeholder={placeholder}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                '&.Mui-focused fieldset': {
                  boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.09)',
                  borderRadius: '20px',
                },
                'label + &': {
                  marginTop: theme.spacing(2),
                },
              },
            }}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        </FormControl>
      )}
      sx={{ ...sx }}
    />
  )
}
