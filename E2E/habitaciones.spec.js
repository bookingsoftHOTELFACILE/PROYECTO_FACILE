import { test, expect } from '@playwright/test';

test('filtrar habitaciones disponibles', async ({ page }) => {

   // ARRANGE
   await page.goto('/');
   await page.getByTitle('Inicia sesión o regístrate como Huésped').click();

   // ACT
   await page.getByRole('button', { name: 'ya tengo registro' }).click();
   await page.getByRole('textbox', { name: 'Ej: 1017283944 o correo@' }).fill('john.doe@example.com');
   await page.getByRole('textbox', { name: 'ingrese su contraseña' }).fill('john123');
   await page.getByRole('button', { name: 'Iniciar Sesión y Continuar' }).click();
   await page.getByRole('button', { name: 'Apartamentos' }).click();
   await page.getByRole('button', { name: 'Reservar' }).first().click();
   await page.getByRole('button',{name:'1', exact: true}).click();
   await page.getByRole('button', {name:'7', exact: true}).click();
   await page.getByRole('button', {name:'Confirmar Reserva'}).click();
   
   //ASSERT
   
   await expect(page.getByText('Reserva presencial')).toBeVisible();
});
