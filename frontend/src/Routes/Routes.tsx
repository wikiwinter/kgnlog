import { Route, Routes as Routers } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute'
import { useAppDispatch, useAppSelector } from '../utils/hooks/redux'
import { useEffect, useState } from 'react'
import { hasAccess } from '../Modules/Auth/redux/auth.slice'
import { layoutRoutes, noLayoutRoutes } from './routesList'
import { Spin } from 'antd'
import AppLayout from './Layout/Layout'

export function Routes() {
    const [isLoaded, setIsLoaded] = useState(false)
    const { access_token } = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch()

    useEffect(() => {
        async function fetchData() {
            setIsLoaded(false)
            await dispatch(hasAccess())
            setIsLoaded(true)
        }
        fetchData()
    }, [dispatch, access_token])
    
    if (!isLoaded) return <Spin fullscreen />
    
    return (
        <>
            <Routers>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute canUseRouteIf={true} ifNotAllowedPath="/signin">
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    {layoutRoutes.map(route => (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                route.protected && route.canUseRouteIf ? (
                                    <ProtectedRoute
                                        canUseRouteIf={Boolean(route.canUseRouteIf)}
                                        ifNotAllowedPath={route.ifNotAllowedPath || '/'}
                                    >
                                        {route.element}
                                    </ProtectedRoute>
                                ) : (
                                    route.element
                                )
                            }
                        />
                    ))}
                </Route>

                {noLayoutRoutes.map(route => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            route.protected && route.canUseRouteIf ? (
                                <ProtectedRoute
                                    canUseRouteIf={Boolean(route.canUseRouteIf)}
                                    ifNotAllowedPath={route.ifNotAllowedPath || '/'}
                                >
                                    {route.element}
                                </ProtectedRoute>
                            ) : (
                                route.element
                            )
                        }
                    />
                ))}
            </Routers>
        </>
    )
}
