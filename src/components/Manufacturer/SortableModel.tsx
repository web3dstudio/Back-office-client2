import { Grid, Typography, useTheme } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TModel } from "../../types";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppControlledTextField from "../AppControlledTextField";
import React from "react";

type Props = {
  model: TModel
  modelIndex: number
  serieIndex: number
}

function SortableModel({ model, modelIndex, serieIndex }: Props) {
  const { t } = useTranslation('manufacturers')
  const theme = useTheme();

  const { control } = useFormContext();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: model.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: 4,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Grid container size={12} columnGap={2} >
        <Grid size={3}>
          <AppControlledTextField
            name={`serieses.${serieIndex}.models.${modelIndex}.name`}
            control={control}
            label={t('modelName', { ns: 'newManufacturer' })}
            placeholder={t('modelName', { ns: 'newManufacturer' })}
          />
        </Grid>
        <Grid size={3}>
          <AppControlledTextField
            name={`serieses.${serieIndex}.models.${modelIndex}.code`}
            control={control}
            label={t('modelCode', { ns: 'newManufacturer' })}
            placeholder={t('modelCode', { ns: 'newManufacturer' })}
          />
        </Grid>
      </Grid>

    </div>
  );
}

export default React.memo(SortableModel);