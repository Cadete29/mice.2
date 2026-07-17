import { useState } from 'react'
import styles from './Donativos.module.css'
import donar1 from '../assets/donativo/donar1.jpg'

const donationDestinations = [
  {
    number: '01',
    title: 'Restauración de ecosistemas',
    description: 'Apoya acciones de reforestación, recuperación de suelos y protección de biodiversidad.',
  },
  {
    number: '02',
    title: 'Limpieza de playas',
    description: 'Contribuye con materiales, logística y jornadas comunitarias para recuperar nuestras costas.',
  },
  {
    number: '03',
    title: 'Educación ambiental',
    description: 'Impulsa talleres, materiales y experiencias educativas para niñas, niños y comunidades.',
  },
  {
    number: '04',
    title: 'Proyectos comunitarios',
    description: 'Fortalece iniciativas locales que generan soluciones ambientales y oportunidades sostenibles.',
  },
]

const Donativos = () => {
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [amount, setAmount] = useState('')

  const handleDonation = (event) => {
    event.preventDefault()
    if (!amount || Number(amount) <= 0) return
    window.location.assign('https://www.mercadopago.com.mx/')
  }

  const resetSelection = () => {
    setSelectedDestination(null)
    setAmount('')
  }

  return (
    <main className={styles.page}>
    <img className={styles.donarImage} src={donar1} alt="" aria-hidden="true" />
    <section className={styles.layout} aria-labelledby="donativos-title">
      <div className={styles.titleBlock}>
        <p>Tu apoyo transforma</p>
        <h1 id="donativos-title">Donativos</h1>
      </div>

      <div className={styles.destinations}>
        {!selectedDestination ? (
          <div className={styles.selectionStep}>
            <h2>Selecciona el destino de tu donativo</h2>
            <div className={styles.grid}>
              {donationDestinations.map((destination) => (
                <button
                  className={styles.card}
                  key={destination.title}
                  onClick={() => setSelectedDestination(destination)}
                  type="button"
                >
                  <h3>{destination.title}</h3>
                  <p>{destination.description}</p>
                  <strong aria-hidden="true">→</strong>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className={styles.amountStep} onSubmit={handleDonation}>
            <button className={styles.backButton} onClick={resetSelection} type="button">
              ← Cambiar destino
            </button>
            <p>Tu donativo será destinado a</p>
            <h2>{selectedDestination.title}</h2>
            <span>{selectedDestination.description}</span>

            <label htmlFor="donation-amount">Anota la cantidad</label>
            <div className={styles.amountField}>
              <span>$</span>
              <input
                id="donation-amount"
                min="1"
                name="cantidad"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={amount}
                required
              />
              <strong>MXN</strong>
            </div>

            <div className={styles.quickAmounts} aria-label="Cantidades sugeridas">
              {[100, 250, 500, 1000].map((value) => (
                <button key={value} onClick={() => setAmount(String(value))} type="button">
                  ${value}
                </button>
              ))}
            </div>

            <button className={styles.donateButton} type="submit">Donar</button>
            <small>Serás dirigido a Mercado Pago para continuar con el proceso.</small>
          </form>
        )}
      </div>
    </section>
    </main>
  )
}

export default Donativos
