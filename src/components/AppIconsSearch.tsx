import { Box, Grid, useTheme } from "@mui/material"
import { useIconsQuery } from "../query/icons.query"
import AppLoading from "./AppLoading"
import AppError from "./AppError"
import type { TIcon } from "../types"



interface IProps {
  onSelect: (icon: TIcon) => void
  selectedIcon: TIcon | null
}

function AppIconsSearch({ onSelect, selectedIcon }: IProps) {
  const theme = useTheme()
  const { data: iconsList, isLoading, isError } = useIconsQuery()

  const isSelected = (iconId: string) => {
    return selectedIcon?.id === iconId
  }

  if (isLoading) {
    return <AppLoading />
  }

  if (isError) {
    return <AppError />
  }

  return (
    <>
      <Grid container spacing={3} >
        {iconsList?.map(icon => (
          <Box
            onClick={() => onSelect(icon)}
            key={icon?.id}
            sx={{
              width: 100,
              height: 100,
              border: isSelected(icon.id)
                ? `2px solid ${theme.palette.primary.main}`
                : '1px solid #ccc',
              borderRadius: theme.shape.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' ? '#000' : '#f7f7f9',
              position: 'relative',
              cursor: 'pointer',
              transition: 'border-color 0.3s, border-width 0.3s',
              '&:hover': {
                border: isSelected(icon.id)
                  ? `2px solid ${theme.palette.primary.main}` // не меняется при ховере, если выбран
                  : `2px solid ${theme.palette.grey[500]}`,   // если не выбран — становится чуть темнее
              },
            }}
          >

            <img
              src={icon?.downloadUri || ''}
              alt="preview"
              style={{
                maxWidth: '80%',
                maxHeight: '80%',
                objectFit: 'contain',
                display: 'block',
              }}
            />

          </Box>
        ))}
      </Grid>
    </>
  )
}

export default AppIconsSearch