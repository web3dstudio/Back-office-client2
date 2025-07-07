import { Accordion, Grid, AccordionSummary, AccordionDetails, Typography, useTheme } from "@mui/material";
import AppActionButton from "../AppActionButton";
import StyledPaper from "../StyledPaper";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TSerie } from "../../types";
import { useTranslation } from "react-i18next";
import AppControlledTextField from "../AppControlledTextField";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import SortableModel from "./SortableModel";
import React from "react";


type Props = {
  serie: TSerie
  onDelete: (id: string) => void
  serieIndex: number
}

function SortableSerie({ serie, onDelete, serieIndex }: Props) {
  const { t } = useTranslation('manufacturers')
  const theme = useTheme();
  const [models, setModels] = useState(serie.models ?? []);

  const { control } = useFormContext();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: serie.id });

  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '100%',
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = models.findIndex(m => m.id === active.id);
      const newIndex = models.findIndex(m => m.id === over?.id);
      setModels(arrayMove(models, oldIndex, newIndex));
      // тут можно вызвать onChange, чтобы сохранить порядок на сервере
    }
  };


  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Grid container size={12} gap={3}>
        <Grid size={'auto'}>
          <AppActionButton
            type='delete'
            onClick={() => onDelete(serie.id)}
          />
        </Grid>
        <Grid size={'grow'}>
          <StyledPaper
            sx={{
              overflow: 'hidden',
              padding: 3,
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Grid container size={12} gap={0}>
              <Grid size={6}>

                <AppControlledTextField
                  name={`serieses.${serieIndex}.name`}
                  control={control}
                  label={t('seriesName', { ns: 'newManufacturer' })}
                  placeholder={t('seriesName', { ns: 'newManufacturer' })}
                />
              </Grid>
            </Grid>
            <Accordion
              expanded={isExpanded}
              onChange={() => setIsExpanded(!isExpanded)}
              elevation={0}
              sx={{
                mt: 0,
                pt: 0,
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDownwardIcon />}
                aria-controls="panel1-content"
                id={`panel${serieIndex}-header`}
                sx={{ py: 0 }}
              >
                <Typography component="span" sx={{ fontSize: '14px', fontWeight: 400, color: theme.palette.text.secondary }}>{t('models', { ns: 'newManufacturer' })}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* {isExpanded &&
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={models.map(m => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {models.map((model, modelIndex) => (
                        <SortableModel
                          key={model.id}
                          model={model}
                          serieIndex={serieIndex}
                          modelIndex={modelIndex}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                } */}
              </AccordionDetails>
            </Accordion>
          </StyledPaper>
        </Grid>
      </Grid>
    </div>
  );
}

export default React.memo(SortableSerie);