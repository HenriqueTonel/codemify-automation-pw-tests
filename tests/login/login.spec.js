import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page_objects/LoginPage.js';
import { HomePage } from '../../page_objects/HomePage.js';
import { DashboardPage } from '../../page_objects/DashboardPage.js';
import { apiLogin } from '../../api/UsersApi.js';

test.describe('Login', () => {
  let loginPage, homePage, dashboardPage;

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto(testInfo.project.use.env.baseUrl);
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('Should login with an existing Admin account', async ({
    page,
    request,
  }, testInfo) => {
    const email = testInfo.project.use.env.adminEmail;
    const password = testInfo.project.use.env.adminPassword;
    const displayRole = 'role: admin';

    const loginResponseJson = await apiLogin(page, request, email, password);
    const displayName = `${loginResponseJson.user.username} ${loginResponseJson.user.user_surname}`;

    await page.goto(testInfo.project.use.env.baseUrl);

    await expect(homePage.dashboardButton).toBeVisible();

    await homePage.dashboardButton.click();

    await expect(dashboardPage.fullUserNameText).toHaveText(displayName);
    await expect(dashboardPage.userRoleText).toHaveText(displayRole);
  });

  test('Should log out', async ({ page, request }, testInfo) => {
    const email = testInfo.project.use.env.adminEmail;
    const password = testInfo.project.use.env.adminPassword;

    await apiLogin(page, request, email, password);

    await page.goto(testInfo.project.use.env.baseUrl);

    await expect(homePage.dashboardButton).toBeVisible();

    await homePage.dashboardButton.click();

    await expect(page).toHaveURL('/dashboard/user/profile');

    await dashboardPage.userMenu.click();
    await dashboardPage.userMenuLogoutItem.click();

    await expect(page).toHaveURL('/auth/login');
  });
});
