import { useEffect, useRef, useState } from 'react'
import logo from '../assets/logo1.png'
import EmailConfirmation from '../components/auth/EmailConfirmation'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import LoginForm from '../components/auth/LoginForm'
import MfaChallengeForm from '../components/auth/MfaChallengeForm'
import RegisterForm from '../components/auth/RegisterForm'
import ResetPasswordForm from '../components/auth/ResetPasswordForm'
import * as authApi from '../services/authApi'
import styles from './SignUp.module.css'

const SignUp = () => {
  const query = new URLSearchParams(window.location.search)
  const tokenFromResetLink = query.get('reset')
  const tokenFromVerificationLink = query.get('verify')
  const [view, setView] = useState(tokenFromResetLink ? 'reset' : tokenFromVerificationLink ? 'verify' : 'login')
  const [confirmation, setConfirmation] = useState(null)
  const [resetToken, setResetToken] = useState(tokenFromResetLink)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(tokenFromVerificationLink))
  const [mfaToken, setMfaToken] = useState(null)
  const verificationStarted = useRef(false)
  const goToDashboard = (user) => {
    window.location.href = user?.tipo === 'administrador' ? '/administracion' : '/dashboard'
  }

  useEffect(() => {
    if (!tokenFromVerificationLink) return
    if (verificationStarted.current) return
    verificationStarted.current = true
    window.history.replaceState({}, document.title, window.location.pathname)
    authApi.verifyEmail(tokenFromVerificationLink)
      .then(() => {
        setConfirmation({ type: 'verified' })
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [tokenFromVerificationLink])

  useEffect(() => {
    if (tokenFromResetLink) window.history.replaceState({}, document.title, window.location.pathname)
  }, [tokenFromResetLink])

  const showView = (nextView) => {
    setConfirmation(null); setResetToken(null); setError(''); setView(nextView)
  }
  const run = async (action) => {
    setError(''); setLoading(true)
    try { await action() } catch (requestError) {
      setError(requestError.message || 'No fue posible conectar con el servidor.')
    } finally { setLoading(false) }
  }
  const handleLogin = async (credentials) => {
    setError(''); setLoading(true)
    try {
      const result = await authApi.login(credentials)
      if (result.mfaRequired) {
        setMfaToken(result.mfaToken)
        setView('mfa')
        return
      }
      goToDashboard(result.user)
    } catch (requestError) {
      if (requestError.code === 'EMAIL_NOT_VERIFIED') {
        setConfirmation({ email: credentials.correoElectronico, type: 'register' })
      } else {
        setError(requestError.message || 'No fue posible conectar con el servidor.')
      }
    } finally { setLoading(false) }
  }
  const handleMfaChallenge = async (code) => {
    setError(''); setLoading(true)
    try {
      const user = await authApi.completeMfaLogin(mfaToken, code)
      goToDashboard(user)
    } catch (requestError) {
      setError(requestError.message || 'No fue posible validar el código.')
    } finally { setLoading(false) }
  }
  const handleRegister = (profile) => {
    if (profile.validationError) return setError(profile.validationError)
    return run(async () => {
      const result = await authApi.register(profile)
      if (result.verificationToken) await authApi.verifyEmail(result.verificationToken)
      setConfirmation({
        email: profile.correoElectronico,
        type: result.verificationToken ? 'verified' : 'register',
        deliveryFailed: result.emailSent === false,
      })
    })
  }
  const handleForgotPassword = (email) => run(async () => {
    const result = await authApi.forgotPassword(email)
    if (result.resetToken) { setResetToken(result.resetToken); setView('reset') }
    else setConfirmation({ email, type: 'forgot' })
  })
  const handleResetPassword = (data) => {
    if (data.validationError) return setError(data.validationError)
    return run(async () => {
      await authApi.resetPassword(resetToken, data.password)
      setConfirmation({ type: 'reset' })
    })
  }
  const handleResendVerification = async () => {
    if (!confirmation?.email) return
    setError(''); setLoading(true)
    try {
      const result = await authApi.resendVerification(confirmation.email)
      if (result.verificationToken) {
        await authApi.verifyEmail(result.verificationToken)
        setConfirmation({ email: confirmation.email, type: 'verified' })
      } else {
        setConfirmation((current) => ({ ...current, resendSent: true }))
      }
    } catch (requestError) {
      setError(requestError.message || 'No fue posible reenviar el correo de confirmación.')
    } finally { setLoading(false) }
  }

  return <main className={styles.page}>
    <section className={styles.authCard} aria-labelledby="auth-title">
      <div className={styles.introPanel}>
        <img src={logo} alt="MICE-LO" />
        <div><p>Una comunidad que transforma</p><h1>Conecta tus ideas con un futuro sostenible.</h1><span>Participa en proyectos, conoce convocatorias y colabora con nuestra red ambiental.</span></div>
      </div>
      <div className={styles.formPanel}>
        {!confirmation && !['forgot', 'reset', 'verify', 'mfa'].includes(view) && <div className={styles.tabs} role="tablist" aria-label="Acceso a la cuenta">
          <button className={view === 'login' ? styles.activeTab : ''} onClick={() => showView('login')} role="tab" aria-selected={view === 'login'} type="button">Iniciar sesión</button>
          <button className={view === 'register' ? styles.activeTab : ''} onClick={() => showView('register')} role="tab" aria-selected={view === 'register'} type="button">Registro</button>
        </div>}
        {confirmation ? <EmailConfirmation
          email={confirmation.email}
          type={confirmation.type}
          onBack={() => showView('login')}
          onResend={confirmation.type === 'register' ? handleResendVerification : undefined}
          resendSent={confirmation.resendSent}
          deliveryFailed={confirmation.deliveryFailed}
          error={error}
          loading={loading}
        />
          : view === 'login' ? <LoginForm onSubmit={handleLogin} onForgotPassword={() => showView('forgot')} error={error} loading={loading} />
            : view === 'register' ? <RegisterForm onSubmit={handleRegister} error={error} loading={loading} />
              : view === 'mfa' ? <MfaChallengeForm onSubmit={handleMfaChallenge} onBack={() => { setMfaToken(null); showView('login') }} error={error} loading={loading} />
              : view === 'reset' ? <ResetPasswordForm onSubmit={handleResetPassword} onBack={() => showView('login')} error={error} loading={loading} />
                : view === 'verify' ? <div className={styles.confirmation}><p className={error ? styles.formError : styles.confirmationHint}>{error || 'Confirmando tu correo…'}</p>{error && <button className={styles.submitButton} onClick={() => showView('login')} type="button">Volver</button>}</div>
                : <ForgotPasswordForm onSubmit={handleForgotPassword} onBack={() => showView('login')} error={error} loading={loading} />}
      </div>
    </section>
  </main>
}
export default SignUp
