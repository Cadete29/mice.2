import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Objetivos from './components/Objetivos'
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

  return (
    <>
      <Header />
      {isChiapasPorElClima ? (
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
      ) : (
        <main>
          <Hero />
          <About />
          <Objetivos />
          <Contacto />
        </main>
      )}
      {!isNuestrosObjetivos && <Footer />}
    </>
  )
}

export default App
