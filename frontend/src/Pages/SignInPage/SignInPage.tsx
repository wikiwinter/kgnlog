import { SignIn } from '../../Modules'
import PageHead from '../../Routes/PageHead'

export function SignInPage() {
    return (
        <>
            <PageHead title="Вход" />
            <SignIn />
        </>
    )
}
