import * as React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
export interface IProtectedRouteProps {
    canUseRouteIf: boolean
    ifNotAllowedPath?: string
    children?: React.ReactNode
}

export function ProtectedRoute(props: IProtectedRouteProps) {
    if (!props.canUseRouteIf) {
        return <Navigate to={props.ifNotAllowedPath || '/'} replace />
    }
    return <>{props.children || <Outlet />}</>
}
