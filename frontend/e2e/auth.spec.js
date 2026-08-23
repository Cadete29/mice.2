import { expect, test } from '@playwright/test'

const json = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/refresh', (route) => json(route, {
    error: { code: 'REFRESH_REQUIRED', message: 'Sin sesión' },
  }, 401))
})

test('completa inicio de sesión con MFA', async ({ page }) => {
  await page.route('**/api/auth/login', (route) => json(route, {
    mfaRequired: true,
    mfaToken: 'challenge-token',
  }))
  await page.route('**/api/auth/mfa/verify', (route) => json(route, {
    user: { id: '1', nombre: 'Ana', tipo: 'usuario' },
    accessToken: 'access-token',
    csrfToken: 'csrf-token',
  }))

  await page.goto('/sign-up')
  await page.getByLabel('Correo electrónico').fill('ana@example.com')
  await page.getByLabel('Contraseña').fill('ClaveSegura1')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Confirma que eres tú' })).toBeVisible()
  await page.getByLabel('Código de autenticación').fill('123456')
  await page.getByRole('button', { name: 'Verificar y entrar' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('micelo-access-token')))
    .toBe('access-token')
})

test('conserva la cuenta y ofrece reenvío cuando falla SMTP', async ({ page }) => {
  await page.route('**/api/auth/register', (route) => json(route, {
    user: { id: '1', nombre: 'Ana', correoElectronico: 'ana@example.com' },
    emailSent: false,
  }, 201))
  await page.route('**/api/auth/resend-verification', (route) => json(route, {
    emailSent: true,
  }))

  await page.goto('/sign-up')
  await page.getByRole('tab', { name: 'Registro' }).click()
  await page.getByLabel('Nombre', { exact: true }).fill('Ana')
  await page.getByLabel('Apellido paterno').fill('Prueba')
  await page.getByLabel('Correo electrónico').fill('ana@example.com')
  await page.getByLabel('Contraseña', { exact: true }).fill('ClaveSegura1')
  await page.getByLabel('Confirmar contraseña').fill('ClaveSegura1')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page.getByText('La cuenta fue creada, pero el correo no pudo enviarse.')).toBeVisible()
  await page.getByRole('button', { name: 'Reenviar correo de confirmación' }).click()
  await expect(page.getByText('Enviamos un nuevo enlace de confirmación.')).toBeVisible()
})

test('elimina el token de verificación de la URL tras confirmarlo', async ({ page }) => {
  await page.route('**/api/auth/verify-email', (route) => json(route, { message: 'ok' }))
  await page.goto('/sign-up?verify=secret-token')
  await expect(page.getByRole('heading', { name: 'Correo confirmado' })).toBeVisible()
  await expect(page).toHaveURL('http://127.0.0.1:4173/sign-up')
})
