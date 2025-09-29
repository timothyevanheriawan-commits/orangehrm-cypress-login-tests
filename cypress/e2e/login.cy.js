describe('Feature: Login - OrangeHRM (opensource demo) - SC_LOGIN_01', () => {
  const loginPath = '/web/index.php/auth/login';
  const validatePath = '/web/index.php/auth/validate';
  const resetPath = '/web/index.php/auth/requestPasswordResetCode';

  beforeEach(() => {
    cy.visit(loginPath);
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('TC-LOGIN-001 - Login dengan kredensial yang valid', () => {
    cy.intercept('POST', validatePath).as('postValidate');

    cy.get('input[name="username"]').clear().type('Admin');
    cy.get('input[name="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    cy.wait('@postValidate').then(({ response }) => {
      expect(response).to.exist;
      expect(response.statusCode).to.be.a('number');
    });

    cy.url().should('include', '/dashboard');
    cy.get('h6').contains(/Dashboard/i).should('exist');
  });

  it('TC-LOGIN-002 - Login dengan password yang salah', () => {
    cy.intercept('POST', validatePath, (req) => {
      req.continue((res) => {
      });
    }).as('postValidatePayload');

    const wrongPassword = 'passwordSalah';
    cy.get('input[name="username"]').clear().type('Admin');
    cy.get('input[name="password"]').clear().type(wrongPassword);
    cy.get('button[type="submit"]').click();

    cy.wait('@postValidatePayload').its('request.body').then((body) => {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      expect(bodyStr).to.include('passwordSalah');
    });

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-003 - Login dengan username yang salah', () => {
    cy.intercept('POST', validatePath).as('postValidateUserCheck');

    cy.get('input[name="username"]').clear().type('Administrator');
    cy.get('input[name="password"]').clear().type('admin123');
    cy.get('button[type="submit"]').click();

    cy.wait('@postValidateUserCheck').its('request.body').then((body) => {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      expect(bodyStr).to.include('Administrator');
    });

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-004 - Login dengan username dan password kosong', () => {
    let validateCalled = false;

    cy.intercept('POST', validatePath, (req) => {
      validateCalled = true;
      req.continue();
    }).as('postValidateShouldNotHappen');

    cy.get('input[name="username"]').clear();
    cy.get('input[name="password"]').clear();
    cy.get('button[type="submit"]').click();

    cy.contains('Required').should('be.visible');

    cy.wait(500);

    cy.then(() => {
      expect(validateCalled, 'validate endpoint should not have been called').to.be.false;
    });

    cy.url().should('include', '/auth/login');
  });

  it('TC-LOGIN-005 - Mengecek fungsionalitas link "Forgot your password?"', () => {
    cy.intercept('GET', resetPath).as('resetPage');

    cy.contains('Forgot your password?').should('be.visible').click();

    cy.wait('@resetPage').then(({ response }) => {
      expect(response).to.exist;
      expect(response.statusCode).to.be.within(200, 399);
    });

    cy.get('h6, h1, h2').contains(/Reset Password/i).should('exist');
    cy.url().should('include', 'requestPasswordResetCode');
  });
});
