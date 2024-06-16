import { SignUp } from '../../Modules/Auth/SignUp/SignUp'
import PageHead from '../../Routes/PageHead'

export function SignInPage() {
    return (
        <>
            <PageHead title="Регистрация" />
            <SignUp />
        </>
    )
}
