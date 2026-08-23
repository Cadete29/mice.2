import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Proyectos from './components/Proyectos'
import Contacto from './components/Contacto'
import Footer from './components/Footer'
import ChiapasPorElClima from './pages/ChiapasPorElClima'
import Convocatorias from './pages/Convocatorias'
import Nosotros from './pages/Nosotros'
import NuestrosObjetivos from './pages/NuestrosObjetivos'
import Familia from './pages/Familia'
import SignUp from './pages/SignUp'
import RegistroPlayas from './pages/RegistroPlayas'
import Donativos from './pages/Donativos'
import LegalPage from './pages/LegalPage'
import Security from './pages/Security'
import Administration from './pages/Administration'
import UserDashboard from './pages/UserDashboard'
import ProjectDetail from './pages/ProjectDetail'
import PublicProfile from './pages/PublicProfile'
import ConvocatoriaDetail from './pages/ConvocatoriaDetail'
import './App.css'

function App() {
  const isChiapasPorElClima = window.location.pathname === '/chiapas-por-el-clima'
  const isConvocatorias = window.location.pathname === '/convocatorias'
  const isNosotros = window.location.pathname === '/nosotros'
  const isNuestrosObjetivos = window.location.pathname === '/nuestros-objetivos'
  const isFamilia = window.location.pathname === '/familia'
  const isSignUp = window.location.pathname === '/sign-up'
  const isRegistroPlayas = window.location.pathname === '/registro-limpieza-playas'
  const isDonativos = window.location.pathname === '/donativos'
  const isSecurity = window.location.pathname === '/seguridad'
  const isAdministration = window.location.pathname === '/administracion'
  const isDashboard = window.location.pathname === '/dashboard'
  const projectDetailId = window.location.pathname.match(/^\/proyectos\/([0-9a-f-]{36})$/i)?.[1]
  const callDetailId = window.location.pathname.match(/^\/convocatorias\/([0-9a-f-]{36})$/i)?.[1]
  const publicProfileId = window.location.pathname.match(/^\/perfiles\/([0-9a-f-]{36})$/i)?.[1]
  const legalDocument = {
    '/aviso-uso-de-imagen': 'imagen',
    '/aviso-de-privacidad': 'privacidad',
    '/deslinde-de-responsabilidad': 'responsabilidad',
    '/terminos-de-uso': 'terminos',
  }[window.location.pathname]

  return (
    <>
      <Header />
      {publicProfileId ? (
        <PublicProfile userId={publicProfileId} />
      ) : callDetailId ? (
        <ConvocatoriaDetail callId={callDetailId} />
      ) : projectDetailId ? (
        <ProjectDetail projectId={projectDetailId} />
      ) : isChiapasPorElClima ? (
        <ChiapasPorElClima />
      ) : isConvocatorias ? (
        <Convocatorias />
      ) : isNosotros ? (
        <Nosotros />
      ) : isNuestrosObjetivos ? (
        <NuestrosObjetivos />
      ) : isFamilia ? (
        <Familia />
      ) : isSignUp ? (
        <SignUp />
      ) : isRegistroPlayas ? (
        <RegistroPlayas />
      ) : isDonativos ? (
        <Donativos />
      ) : isSecurity ? (
        <Security />
      ) : isAdministration ? (
        <Administration />
      ) : isDashboard ? (
        <UserDashboard />
      ) : legalDocument ? (
        <LegalPage documentType={legalDocument} />
      ) : (
        <main>
          <Hero />
          <About />
          <Proyectos />
          <Contacto />
        </main>
      )}
      {!isNuestrosObjetivos && <Footer />}
    </>
  )
}

export default App
