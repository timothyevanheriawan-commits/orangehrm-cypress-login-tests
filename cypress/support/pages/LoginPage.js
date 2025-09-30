class LoginPage {
  constructor() {
    this.loginPath = '/web/index.php/auth/login';
    this.validatePath = '/web/index.php/auth/validate';
    this.resetPath = '/web/index.php/auth/requestPasswordResetCode';

    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.submitButton = 'button[type="submit"]';
    this.formError = '.oxd-alert-content-text, .oxd-input-field-error-message';
  }

  visit() {
    cy.visit(this.loginPath);
    cy.get(this.usernameInput).should('exist');
    cy.get(this.passwordInput).should('exist');
  }

  enterUsername(username) {
    cy.get(this.usernameInput).clear().type(username);
  }

  enterPassword(password) {
    cy.get(this.passwordInput).clear().type(password);
  }

  submit() {
    cy.get(this.submitButton).click();
  }

  submitWithInterceptAlias(alias = 'postValidate') {
    cy.intercept('POST', this.validatePath).as(alias);
    this.submit();
    return alias;
  }

  waitForValidate(alias = 'postValidate') {
    return cy.wait(`@${alias}`);
  }

  clickForgotPassword() {
    cy.contains('Forgot your password?').should('be.visible').click();
  }

  getErrorText() {
    return cy.get(this.formError).then(($els) => {
      const visible = $els.toArray().filter(el => Cypress.$(el).is(':visible'));
      if (visible.length) return Cypress.$(visible[0]).text();
      return $els.text();
    });
  }
}

export default new LoginPage();
