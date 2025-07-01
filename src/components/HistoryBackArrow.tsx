
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import { useTranslation } from "react-i18next";
import { Box, Button } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";

function HistoryBackArrow() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box>
        <Button
          onClick={() => {
            navigate({ to: '..' });
          }}
          variant="text"
          startIcon={<KeyboardBackspaceOutlinedIcon />}
        >
          {t("history-back-button.label", { ns: "common" })}
        </Button>
      </Box>
    </Box>
  );
}

export default HistoryBackArrow;
