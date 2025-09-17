import { Box, Button, Collapse, Grid, IconButton, TextField, Typography, useTheme } from "@mui/material";
import i18next, { t } from "i18next";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/he'
import localeData from 'dayjs/plugin/localeData'
import type { OpinionsFilters } from "../../types";
import TuneIcon from '@mui/icons-material/Tune';
import { useState } from "react";



interface IProps {
  filters: OpinionsFilters;
  setFilters: (filters: OpinionsFilters) => void;
  onSearch: () => void;
}

dayjs.extend(localeData)

export default function OpinionsFilter({ filters, setFilters, onSearch }: IProps) {

  const theme = useTheme()
  const [expanded, setExpanded] = useState(false);

  return (<>
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <Grid container spacing={2} columns={14} sx={{ width: '100%' }}>

        <Grid size={2}>
          <Box sx={{ pt: 3, position: 'relative' }}>
            <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
              {t('byDate', { ns: 'options' })}
            </Typography>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18next.language}
            >
              <DatePicker
                value={filters.FromDate ? dayjs(filters.FromDate) : null}
                onChange={date => {
                  setFilters({
                    ...filters,
                    FromDate: date ? date.format('YYYY-MM-DD') : ''
                  });
                }}
                slotProps={{
                  field: {
                    clearable: true, onClear: () => {
                      setFilters({
                        ...filters,
                        FromDate: ''
                      });
                    }
                  },
                  textField: {
                    size: 'small',
                    variant: 'outlined',
                    fullWidth: true,
                    sx: {
                      '&.MuiPickersTextField-root fieldset': {
                        borderRadius: '24px',
                      },
                      '&.MuiPickersTextField-root.Mui-focused fieldset': {
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                      },
                    },
                    placeholder: t('date', { ns: 'search' }),
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>

        <Grid size={'auto'} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ textTransform: 'capitalize', mt: 3 }}>
            {t('until', { ns: 'options' })}
          </Typography>
        </Grid>

        <Grid size={2}>
          <Box sx={{ pt: 3, position: 'relative' }}>
            <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
              {" "}
            </Typography>

            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={i18next.language}
            >
              <DatePicker
                value={filters.ToDate ? dayjs(filters.ToDate) : null}
                onChange={date => {
                  setFilters({
                    ...filters,
                    ToDate: date ? date.format('YYYY-MM-DD') : ''
                  });
                }}
                slotProps={{
                  field: {
                    clearable: true, onClear: () => {
                      setFilters({
                        ...filters,
                        ToDate: ''
                      });
                    }
                  },
                  textField: {
                    size: 'small',
                    variant: 'outlined',
                    fullWidth: true,
                    sx: {
                      '&.MuiPickersTextField-root fieldset': {
                        borderRadius: '24px',
                      },
                      '&.MuiPickersTextField-root.Mui-focused fieldset': {
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                      },
                    },
                    placeholder: t('toDate', { ns: 'search' }),
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>

        <Grid size={"grow"}>
          <Box sx={{ pt: 3, position: 'relative' }}>
            <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
              {t('number', { ns: 'options' })}
            </Typography>

            <TextField
              value={filters.Number}
              onChange={e => {
                setFilters({
                  ...filters,
                  Number: e.target.value
                });
              }}
              size='small'
              variant='outlined'
              fullWidth
              placeholder={t('number', { ns: 'options' })}
            />
          </Box>
        </Grid>

        <Grid size={"grow"}>
          <Box sx={{ pt: 3, position: 'relative' }}>
            <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
              {t('customer', { ns: 'options' })}
            </Typography>

            <TextField
              value={filters.OrdererName}
              onChange={e => {
                setFilters({
                  ...filters,
                  OrdererName: e.target.value
                });
              }}
              size='small'
              variant='outlined'
              fullWidth
              placeholder={t('customer', { ns: 'options' })}
            />
          </Box>
        </Grid>

        <Grid size={"grow"}>
          <Box sx={{ pt: 3, position: 'relative' }}>
            <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
              {t('licNum', { ns: 'options' })}
            </Typography>
            <TextField
              value={filters.LicenseNumber}
              onChange={e => {
                setFilters({
                  ...filters,
                  LicenseNumber: e.target.value
                });
              }}
              size='small'
              variant='outlined'
              fullWidth
              placeholder={t('licNum', { ns: 'options' })}
            />
          </Box>
        </Grid>

        <Grid size={'auto'}>
          <Button onClick={onSearch} variant="contained" color="primary" sx={{ textTransform: 'capitalize', mt: 3 }}>
            {t('search', { ns: 'options' })}
          </Button>
        </Grid>

        <Grid size={'auto'}>
          <IconButton onClick={() => setExpanded(!expanded)} color="primary" sx={{ textTransform: 'capitalize', mt: 3 }}>
            <TuneIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Collapse in={expanded}>
        <Grid container spacing={2} columns={12} sx={{ width: '100%', mt: 2, pt: 2 }}>

          <Grid size={6}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {t('tozeretNm', { ns: 'options' })}
              </Typography>
              <TextField
                value={filters.TozeretName}
                onChange={e => {
                  setFilters({
                    ...filters,
                    TozeretName: e.target.value
                  });
                }}
                size='small'
                variant='outlined'
                fullWidth
                placeholder={t('tozeretNm', { ns: 'options' })}
              />
            </Box>
          </Grid>

          <Grid size={6}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {t('degemNm', { ns: 'options' })}
              </Typography>
              <TextField
                value={filters.DegemName}
                onChange={e => {
                  setFilters({
                    ...filters,
                    DegemName: e.target.value
                  });
                }}
                size='small'
                variant='outlined'
                fullWidth
                placeholder={t('degemNm', { ns: 'options' })}
              />
            </Box>
          </Grid>

          <Grid size={3}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {t('manufacturerCode', { ns: 'options' })}
              </Typography>
              <TextField
                value={filters.ManufacturerCode}
                onChange={e => {
                  setFilters({
                    ...filters,
                    ManufacturerCode: e.target.value
                  });
                }}
                size='small'
                variant='outlined'
                fullWidth
                placeholder={t('manufacturerCode', { ns: 'options' })}
              />
            </Box>
          </Grid>

          <Grid size={3}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {t('manufacturer', { ns: 'options' })}
              </Typography>
              <TextField
                value={filters.ManufacturerName}
                onChange={e => {
                  setFilters({
                    ...filters,
                    ManufacturerName: e.target.value
                  });
                }}
                size='small'
                variant='outlined'
                fullWidth
                placeholder={t('manufacturer', { ns: 'options' })}
              />
            </Box>
          </Grid>

          <Grid size={3}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {t('byUpdateDate', { ns: 'options' })}
              </Typography>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={i18next.language}
              >
                <DatePicker
                  value={filters.UpdateFromDate ? dayjs(filters.UpdateFromDate) : null}
                  onChange={date => {
                    setFilters({
                      ...filters,
                      UpdateFromDate: date ? date.format('YYYY-MM-DD') : ''
                    });
                  }}
                  slotProps={{
                    field: {
                      clearable: true, onClear: () => {
                        setFilters({
                          ...filters,
                          UpdateFromDate: ''
                        });
                      }
                    },
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      fullWidth: true,
                      sx: {
                        '&.MuiPickersTextField-root fieldset': {
                          borderRadius: '24px',
                        },
                        '&.MuiPickersTextField-root.Mui-focused fieldset': {
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                        },
                      },
                      placeholder: t('updateFromDate', { ns: 'search' }),
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Grid>

          <Grid size={3}>
            <Box sx={{ pt: 3, position: 'relative' }}>
              <Typography variant="body2" sx={{ position: 'absolute', top: 0, left: 0, marginInlineStart: 2, color: theme.palette.text.secondary }}>
                {" "}
              </Typography>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={i18next.language}
              >
                <DatePicker
                  value={filters.UpdateToDate ? dayjs(filters.UpdateToDate) : null}
                  onChange={date => {
                    setFilters({
                      ...filters,
                      UpdateToDate: date ? date.format('YYYY-MM-DD') : ''
                    });
                  }}
                  slotProps={{
                    field: {
                      clearable: true, onClear: () => {
                        setFilters({
                          ...filters,
                          UpdateToDate: ''
                        });
                      }
                    },
                    textField: {
                      size: 'small',
                      variant: 'outlined',
                      fullWidth: true,
                      sx: {
                        '&.MuiPickersTextField-root fieldset': {
                          borderRadius: '24px',
                        },
                        '&.MuiPickersTextField-root.Mui-focused fieldset': {
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                        },
                      },
                      placeholder: t('updateToDate', { ns: 'search' }),
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Grid>

        </Grid>
      </Collapse>
    </Box>
  </>)
}