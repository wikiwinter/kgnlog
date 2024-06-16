import { SignUp } from '../Modules/Auth/SignUp/SignUp';
import { ShipmentPage, SignInPage, UsersPage } from '../Pages';
import { HomePage } from '../Pages/HomePage/HomePage';
import { UnloadingPage } from '../Pages/UnloadingPage/UnloadingPage';
import { ShipmentPages } from '../Pages/ShipmentPage/ShipmentPages';
import { UnloadingPages } from '../Pages/UnloadingPage/UnloadingPages';

interface RouteType {
    path: string;
    element: React.ReactNode;
    title?: string;

    protected?: boolean;
    canUseRouteIf?: string;
    ifNotAllowedPath?: string;
}

const layoutRoutes: RouteType[] = [
    {
        path: '/users',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/',
        element: <UsersPage />,
        title: 'Пользователи',
    },
    {
        path: '/',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/signin',
        element: <HomePage />,
        title: 'Главная',
    },
    {
        path: '/shipment',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/signin',
        element: <ShipmentPage />,
        title: 'Погрузка',
    },
    {
        path: '/shipment-pages',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/signin',
        element: <ShipmentPages />,
        title: 'Погрузка Караганда-Алматы',
    },
    {
        path: '/unloading',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/signin',
        element: <UnloadingPage />,
        title: 'Выгрузка',
    },
    {
        path: '/unloading-pages',
        protected: true,
        canUseRouteIf: '!!access',
        ifNotAllowedPath: '/signin',
        element: <UnloadingPages />,
        title: 'Выгрузка Алматы',
    },
];

const noLayoutRoutes: RouteType[] = [
    {
        path: '/signin',
        protected: true,
        canUseRouteIf: '!access',
        ifNotAllowedPath: '/',
        element: <SignInPage />,
        title: 'Вход',
    },
    {
        path: '/signup',
        protected: true,
        canUseRouteIf: '!access',
        ifNotAllowedPath: '/',
        element: <SignUp />,
        title: 'Регистрация',
    },
];

export { noLayoutRoutes, layoutRoutes };
