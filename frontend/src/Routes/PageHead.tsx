import { Helmet } from 'react-helmet'
import { CONFIG } from '../utils/helpers/config/env'

type Props = {
    title: string
    children?: any
}

const PageHead = (props: Props) => {
    return (
        <>
            <Helmet>
                <title>
                    {props.title} - {CONFIG.APP_TITLE}
                </title>
            </Helmet>
            {props?.children}
        </>
    )
}
export default PageHead
