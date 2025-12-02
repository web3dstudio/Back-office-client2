import { Link } from '@tanstack/react-router'
import { Button, type ButtonProps } from '@mui/material'
import type { LinkProps } from '@tanstack/react-router'

type LinkButtonProps = ButtonProps & {
    to: LinkProps['to']
    preload?: LinkProps['preload']
}

/**
 * Кнопка с навигацией через TanStack Router
 * Объединяет функциональность Link и Button
 * 
 * @example
 * <LinkButton to="/users/new" variant="contained">
 *   Добавить пользователя
 * </LinkButton>
 */
export default function LinkButton({ to, preload = 'intent', children, ...buttonProps }: LinkButtonProps) {
    return (
        <Link to={to} preload={preload} style={{ textDecoration: 'none' }}>
            <Button {...buttonProps} fullWidth>
                {children}
            </Button>
        </Link>
    )
}
