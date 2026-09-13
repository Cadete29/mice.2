import { expect, test } from '@playwright/test';

test('selects across pages, previews selected recipients and sends to all regardless of filters', async ({ page }) => {
  const event = { id: 'ce55c2f4-145b-4539-bda0-ae092287e817', name: 'Evento de prueba', number: 1, registrations: 12, status: 'abierto' };
  const participants = Array.from({ length: 12 }, (_, index) => ({
    id: `a551806b-d186-4c0f-a95b-${String(index + 1).padStart(12, '0')}`,
    firstName: `Persona ${String(index + 1).padStart(2, '0')}`, lastName: 'Prueba',
    email: `persona${index + 1}@example.com`, birthDate: '1995-01-01', createdAt: '2026-01-01', transport: 'necesita-transporte',
  }));
  const requests = [];
  await page.addInitScript(() => sessionStorage.setItem('micelo-access-token', 'test-token'));
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    let json = {};
    if (path.endsWith('/auth/me')) json = { user: { nombre: 'Admin', tipo: 'administrador' } };
    else if (path.endsWith('/admin/users')) json = { users: [], pagination: { total: 0, limit: 20 } };
    else if (path.endsWith('/admin/projects')) json = { projects: [] };
    else if (path.endsWith('/calls')) json = { calls: [] };
    else if (path.endsWith('/emails')) {
      if (route.request().method() === 'POST') {
        requests.push(route.request().postDataJSON());
        json = { batchId: 'test-batch' };
      } else json = { batches: [] };
    } else if (path.endsWith('/admin/events')) json = { events: [event] };
    else if (path.endsWith('/beach-registrations/admin')) json = { registrations: participants };
    return route.fulfill({ json });
  });
  await page.goto('/administracion');
  await page.getByRole('button', { name: 'Ver registros', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Seleccionar a Persona 01 Prueba', exact: true }).check();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Seleccionar a Persona 11 Prueba', exact: true }).check();
  await page.getByLabel('Asunto', { exact: true }).fill('Punto de encuentro');
  await page.getByLabel('Mensaje', { exact: true }).fill('Nos vemos a las nueve.');
  await page.getByRole('button', { name: 'Revisar envío' }).click();
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Confirmar envío a 2 direcciones' }).click();
  await expect(page.getByText('Envío en cola.', { exact: false })).toBeVisible();
  expect(requests[0].participantIds).toEqual([participants[0].id, participants[10].id]);
  await page.getByLabel('Buscar participante').fill('Persona 01');
  await page.getByLabel('Destinatarios', { exact: true }).selectOption('all');
  await page.getByLabel('Asunto', { exact: true }).fill('Aviso general');
  await page.getByLabel('Mensaje', { exact: true }).fill('Información para todas las personas.');
  await page.getByRole('button', { name: 'Revisar envío' }).click();
  await page.getByRole('button', { name: 'Confirmar envío a 12 direcciones' }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1].participantIds).toHaveLength(12);
});
