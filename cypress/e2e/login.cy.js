describe('Feature: Login - OrangeHRM (opensource demo) - SC_LOGIN_01', () => {
  const loginPath = '/web/index.php/auth/login';
  const baseUrl = 'https://opensource-demo.orangehrmlive.com';

  beforeEach(() => {
    cy.visit(baseUrl + loginPath);
  });

  it('TC-LOGIN-001 - Login dengan kredensial yang valid', () => {
    cy.get('input[name="username"]').clear().type('Admin');
    cy.get('input[name="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('h6').contains(/Dashboard/i).should('exist');
  });

  it('TC-LOGIN-002 - Login dengan password yang salah', () => {
    cy.get('input[name="username"]').clear().type('Admin');
    cy.get('input[name="password"]').clear().type('passwordSalah');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-003 - Login dengan username yang salah', () => {
    cy.get('input[name="username"]').clear().type('Administrator');
    cy.get('input[name="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-004 - Login dengan username dan password kosong', () => {
    cy.get('input[name="username"]').clear();
    cy.get('input[name="password"]').clear();
    cy.get('button[type="submit"]').click();


    cy.contains('Required').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-005 - Mengecek fungsionalitas link "Forgot your password?"', () => {
    cy.contains('Forgot your password?').should('be.visible').click();


    cy.url().should('include', 'requestPasswordResetCode');
    cy.get('h6, h1, h2').contains(/Reset Password/i).should('exist');
  });
});
