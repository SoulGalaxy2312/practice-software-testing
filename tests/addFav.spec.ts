import { test, expect, request } from '@playwright/test';

test.describe('Favorite API', () => {
  let authToken: string;
    console.log("1");
  test.beforeAll(async ({ playwright }) => {
    // Tạo request context với baseURL để khỏi phải lặp lại
    const requestContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8091',
    });

    // Login để lấy JWT token
    const loginResponse = await requestContext.post('/users/login', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: 'customer@practicesoftwaretesting.com',
        password: 'welcome01',
      },
    });

    expect(loginResponse.ok()).toBeTruthy();

    const body = await loginResponse.json();
    authToken = `Bearer ${body.access_token}`;
    await requestContext.dispose();
  });

  test('should add a favorite successfully', async ({ request }) => {
    const response = await request.post('/favorites', {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json',
      },
      data: { product_id: 4 }, 
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('product_id', 4);
    expect(body).toHaveProperty('user_id', 2);
  });

  test('should fail when product_id is missing', async ({ request }) => {
    const response = await request.post('/favorites', {
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json',
      },
      data: {},
    });

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body).toHaveProperty('message', "Requested item not found");
  });

  test('should fail without authentication', async ({ request }) => {
    const response = await request.post('/favorites', {
      data: { product_id: 1 },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty('message', "Unauthorized");
  });
});
