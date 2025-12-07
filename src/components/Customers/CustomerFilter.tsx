import { Button, Grid } from "@mui/material"
import { useCustomerTypesQuery } from "../../query/customerTypes.query"
import AppCheckboxesTags from "../AppCheckboxesTags"
import { t } from "i18next"
import { useTranslation } from "react-i18next"
import AppTextField from "../AppTextField"
import type { CustomersFilters } from "../../routes/_authenticated/customers"

interface CustomerFilterProps {
  filters: CustomersFilters
  setFilters: (filters: any) => void
  onSearch: () => void
}

export default function CustomerFilter({ filters, setFilters, onSearch }: CustomerFilterProps) {
  const { data: customerTypes, isLoading: isCustomerTypesLoading } = useCustomerTypesQuery()
  const { i18n } = useTranslation()

  return (<>
    <Grid container columns={12} columnSpacing={2} sx={{ width: '100%' }}>

      <Grid size={6}>
        <AppCheckboxesTags
          name="filterType"
          loading={isCustomerTypesLoading}
          value={customerTypes?.filter(type => filters.CustomerTypeIds?.includes(type.id)) || []}
          onChange={(value) => setFilters((prev: CustomersFilters) => ({ ...prev, CustomerTypeIds: value.map(item => item.id) }))}
          label={t('filterType', { ns: 'customers' })}
          options={customerTypes || []}
          getOptionLabel={(option) => i18n.language === 'he' ? option.name : (option.nameEn || option.name)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </Grid>
      <Grid size={3}>
        <AppTextField
          name="filterName"
          label={t('filterName', { ns: 'customers' })}
          value={filters.Fullname}
          onChange={(value) => setFilters((prev: CustomersFilters) => ({ ...prev, Fullname: value }))}
        />
      </Grid>
      <Grid size={2}>
        <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={onSearch}>
          {t('search', { ns: 'customers' })}
        </Button>
      </Grid>

    </Grid>

  </>)
}