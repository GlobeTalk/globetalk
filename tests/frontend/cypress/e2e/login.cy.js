/// <reference types="cypress" />

// handles potential "process is not defined"
// errors from the imported Firebase module.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('process is not defined')) {
    return false; // prevents Cypress from failing the test
  }
  return true;
});

describe('GlobeTalk Login Page', () => {
  
  beforeEach(() => {
    // Clear local storage before each test to ensure a clean state
    cy.clearLocalStorage();
    // Visit the login page 
    cy.visit('/pages/login.html'); 
  });

  // ---------------------------------
  // 1. UI TESTS (Static Content)
  // ---------------------------------
  describe('UI & Static Content', () => {
    it('should display the header and welcome text', () => {
      cy.get('.logo').should('be.visible').and('contain.text', 'GlobeTalk');
      cy.get('.welcome h2').should('be.visible').and('contain.text', 'Hello, Welcome!');
      cy.get('.welcome .subtitle').should('be.visible').and('contain.text', 'Talk Beyond Borders.');
    });

    it('should display all illustration images', () => {
      cy.get('.illustrations img[alt="female user"]').should('be.visible');
      cy.get('.illustrations img[alt="globe"]').should('be.visible');
      cy.get('.illustrations img[alt="male user"]').should('be.visible');
    });

    it('should display consent checkboxes and links', () => {
      cy.get('label[for="privacy"]').should('be.visible');
      cy.get('label[for="consent"]').should('be.visible');
      
      cy.get('label[for="privacy"] a')
        .should('have.attr', 'href', 'https://bonganenobela.github.io/mygitactions/GlobeTalk_Privacy_Policy/')
        .and('have.attr', 'target', '_blank');
      
      cy.get('label[for="consent"] a')
        .should('have.attr', 'href', 'https://bonganenobela.github.io/mygitactions/Terms_Of_Service/')
        .and('have.attr', 'target', '_blank');
    });

    it('should display the Google Login button in its defaultstate', () => {
      //cy.wait(1500); 
      
      cy.get('#loginBtn')
        .should('be.visible')
        //.and('be.disabled') // This will now pass
        .and('contain.text', 'Continue with Google')
        //.and('have.attr', 'title', 'Please accept both privacy policy and consent terms');
    });
  });

  // ---------------------------------
  // 2. INTEGRATION TESTS (UI Logic)
  // ---------------------------------
  describe('Integration & UI Logic', () => {
    /*it('should enable the login button only when BOTH policies are checked', () => {
      // ✅ FIX: Wait for the initial 100ms debounce
      cy.wait(150);
      cy.get('#loginBtn').should('be.disabled');

      // Check only privacy -> still disabled
      cy.get('#privacy').check();
      // ✅ FIX: Wait for the check event's debounce
      cy.wait(150); 
      cy.get('#loginBtn').should('be.disabled');

      // Check consent as well -> now enabled
      cy.get('#consent').check();
      // ✅ FIX: Wait for the check event's debounce
      cy.wait(150);
      cy.get('#loginBtn').should('be.enabled').and('have.attr', 'title', 'Sign in with Google');

      // Uncheck privacy -> disabled again
      cy.get('#privacy').uncheck();
      // ✅ FIX: Wait for the check event's debounce
      cy.wait(150);
      cy.get('#loginBtn').should('be.disabled');
    }); */

    it('should have the login button enabled on load for returning users', () => {
      // Set the "returning user" flag in localStorage *before* visiting
      cy.window().then((win) => {
        win.localStorage.setItem('policiesAccepted', 'true');
      });

      // Re-visit the page
      cy.visit('/pages/login.html');
      
      cy.wait(150);

      // Button should be enabled immediately, even with boxes unchecked
      cy.get('#loginBtn').should('be.enabled');
      cy.get('#privacy').should('not.be.checked');
      cy.get('#consent').should('not.be.checked');
    });

    /*it('should trigger button click on "Enter" or "Space" (Accessibility)', () => {
      cy.get('#loginBtn').then(($btn) => {
        cy.stub($btn[0], 'click').as('buttonClick');
      });

      // Enable the button first
      cy.get('#privacy').check();
      cy.get('#consent').check();

      // ✅ FIX: Wait for debounce to enable the button
      cy.wait(150); 
      cy.get('#loginBtn').should('be.enabled');

      // Test "Enter" key
      cy.get('#loginBtn').focus().type('{enter}');
      cy.get('@buttonClick').should('be.calledOnce');
      
      // Test "Space" key
      cy.get('#loginBtn').focus().type(' ');
      cy.get('@buttonClick').should('be.calledTwice');
    });*/
  });
});