import styles from '../../pages/SignUp.module.css'

const AuthHeading = ({ eyebrow, title, description }) => (
  <div className={styles.heading}>
    <p>{eyebrow}</p>
    <h2 id="auth-title">{title}</h2>
    <span>{description}</span>
  </div>
)

export default AuthHeading
