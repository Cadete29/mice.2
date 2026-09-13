import { expect, test } from '@playwright/test';

test('shows event description and uploaded photographs on the generic registration page', async ({ page }) => {
  const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5XkAAAAASUVORK5CYII=';
  await page.route('**/api/beach-registrations/active', route => route.fulfill({
    json: { event: { id: 'event-test', name: 'Taller comunitario', description: 'Aprende con nuestra comunidad.\nActividad para todas las personas.', photos: Array(10).fill(photo) } },
  }));
  await page.goto('/registro-eventos');
  await expect(page.getByRole('heading', { name: 'Taller comunitario' })).toBeVisible();
  await expect(page.getByText('Aprende con nuestra comunidad.')).toBeVisible();
  const image = page.getByRole('img', { name: 'Taller comunitario · fotografía 1', exact: true });
  await expect(image).toHaveAttribute('src', photo);
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  await expect(image).toHaveCSS('opacity', '1');
  await expect(page.getByRole('img', { name: 'Taller comunitario · fotografía 2', exact: true })).toHaveCSS('opacity', '1', { timeout: 8000 });
  await expect(page.getByRole('heading', { name: 'Datos de registro' })).toBeVisible();
});

test('redirects the old beach registration URL to events', async ({ page }) => {
  await page.goto('/registro-limpieza-playas');
  await expect(page).toHaveURL(/\/registro-eventos$/);
});
