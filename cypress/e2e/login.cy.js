import LoginPage from '../support/pages/LoginPage';

describe('Feature: Login - OrangeHRM (opensource demo) - SC_LOGIN_01 (POM)', () => {
  const validatePath = '/web/index.php/auth/validate';
  const resetPath = '/web/index.php/auth/requestPasswordResetCode';

  beforeEach(() => {
    LoginPage.visit();
    cy.fixture('users').as('users');
  });

  it('TC-LOGIN-001 - Login dengan kredensial yang valid', function () {
    cy.intercept('POST', validatePath).as('postValidate');

    LoginPage.enterUsername(this.users.valid.username);
    LoginPage.enterPassword(this.users.valid.password);
    LoginPage.submit();

    cy.wait('@postValidate').then(({ response }) => {
      expect(response).to.exist;
      expect(response.statusCode).to.be.a('number');
      expect(response.statusCode).to.be.within(200, 399);
    });

    cy.url().should('include', '/dashboard');
    cy.get('h6').contains(/Dashboard/i).should('exist');
  });

  it('TC-LOGIN-002 - Login dengan password yang salah (cek payload)', function () {
    cy.intercept('POST', validatePath, (req) => {
      req.continue();
    }).as('postValidatePayload');

    LoginPage.enterUsername(this.users.invalidPassword.username);
    LoginPage.enterPassword(this.users.invalidPassword.password);
    LoginPage.submit();

    cy.wait('@postValidatePayload').its('request.body').then((body) => {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      expect(bodyStr).to.include(this.users.invalidPassword.password);
    });

    cy.contains(/Invalid credentials/i).should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-003 - Login dengan username yang salah (cek payload)', function () {
    cy.intercept('POST', validatePath).as('postValidateUserCheck');

    LoginPage.enterUsername(this.users.invalidUsername.username);
    LoginPage.enterPassword(this.users.invalidUsername.password);
    LoginPage.submit();

    cy.wait('@postValidateUserCheck').its('request.body').then((body) => {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      expect(bodyStr).to.include(this.users.invalidUsername.username);
    });

    cy.contains(/Invalid credentials/i).should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-004 - Login dengan username dan password kosong (validasi front-end, endpoint tidak dipanggil)', function () {
    let validateCalled = false;
    cy.intercept('POST', validatePath, (req) => {
      validateCalled = true;
      req.continue();
    }).as('postValidateShouldNotHappen');

    cy.get('input[name="username"]').clear();
    cy.get('input[name="password"]').clear();
    LoginPage.submit();

    cy.contains(/\bRequired\b/i).should('be.visible');

    cy.wait(500);

    cy.then(() => {
      expect(validateCalled, 'validate endpoint should not have been called').to.be.false;
    });

    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-005 - Mengecek fungsionalitas link "Forgot your password?"', () => {
    cy.intercept('GET', resetPath).as('resetPage');

    LoginPage.clickForgotPassword();

    cy.wait('@resetPage').then(({ response }) => {
      expect(response).to.exist;
      expect(response.statusCode).to.be.within(200, 399);
    });

    cy.get('h6, h1, h2').contains(/Reset Password/i).should('exist');
    cy.url().should('include', 'requestPasswordResetCode');
  });
});
