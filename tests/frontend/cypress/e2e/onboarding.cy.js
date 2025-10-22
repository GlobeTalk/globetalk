/// <reference types="cypress" />

describe('GlobeTalk Onboarding Page', () => {
  // ---------------------------------
  // 1. UI & STATIC CONTENT TESTS
  // ---------------------------------
  describe('UI & Static Content', () => {
    beforeEach(() => {
      // Stub network calls to prevent errors
      cy.intercept('GET', '**/firebase.js', 'export function observeUser(){};').as('stubAuth');
      cy.intercept('GET', 'https://api.languagetoolplus.com/v2/languages', { body: [] }).as('stubLangs');
      cy.visit('/pages/onboarding.html');
    });

    it('should display the header and all form sections', () => {
      cy.get('h1').should('contain.text', 'GlobeTalk');
      cy.get('.subtitle').should('be.visible');
      cy.get('.form-section h2').should('have.length', 2);
      cy.get('.form-section').eq(0).should('contain.text', 'Profile Information');
      cy.get('.form-section').eq(1).should('contain.text', 'Personal Info');
    });

    it('should display all required form fields and labels', () => {
      cy.get('label[for="languages"]').should('be.visible');
      cy.get('label[for="region"]').should('be.visible');
      cy.get('label[for="ageRange"]').should('be.visible');
      cy.get('label[for="gender"]').should('be.visible');
      cy.get('label[for="hobbies"]').should('be.visible');
      cy.get('label[for="bio"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').and('contain.text', 'Create My Profile');
    });

    it('should display the footer', () => {
      cy.get('footer p').should('be.visible');
    });
  });

  // ---------------------------------
// 2. INTEGRATION TEST (UNAUTHENTICATED)
// ---------------------------------
describe.skip('Integration Test - Unauthenticated User', () => {
  // FIX: Declare stub variable here
  let alertStub;

  beforeEach(() => {
    // Assign the stub to the variable
    alertStub = cy.stub().as('alertStub');
    //  Pass the variable (which is a function) to the listener
    cy.on('window:alert', alertStub); 
    
    cy.on('window:before:load', (win) => {
      cy.stub(win, 'location', { href: '' }).as('locationStub');
    });
  }); 

  it('should alert and redirect to login if user is not authenticated', () => {
    cy.intercept('GET', '**/firebase.js', {
      body: `
        export function observeUser(callback) {
          callback(null); 
        }
      `,
    }).as('stubbedAuth');

    cy.visit('/pages/onboarding.html');
    cy.wait('@stubbedAuth'); // Wait for the auth logic to trigger

    cy.get('@alertStub').should('be.calledWith', 'You need to be logged in to create a profile.');
    cy.get('@locationStub').its('href').should('eq', 'login.html');
  });
});

  // ---------------------------------
  // 3. INTEGRATION TEST (AUTHENTICATED - HAPPY PATH)
  // ---------------------------------
  describe.skip('Integration Test - Authenticated User (Full Form)', () => {
    // FIX: Register all window listeners ONCE for this test suite
    beforeEach(() => {
      // Stub Browser APIs: Timezone, Alert, and Location
      cy.stub().as('alertStub');
      cy.on('window:alert', cy.get('@alertStub'));
      
      cy.on('window:before:load', (win) => {
        // Stub Timezone
        cy.stub(win.Intl, 'DateTimeFormat').returns({
          resolvedOptions: () => ({
            timeZone: 'America/New_York',
          }),
        });
        // Stub location.href
        cy.stub(win, 'location', { href: '' }).as('locationStub');
      });
      
      // Stub Auth: Simulate a logged-IN user
      cy.intercept('GET', '**/firebase.js', {
        body: `
          export function observeUser(callback) {
            const mockUser = {
              uid: 'test-user-123',
              getIdToken: () => Promise.resolve('mock-id-token-xyz')
            };
            callback(mockUser); 
          }
        `,
      }).as('stubbedAuth');

      // Stub Language API
      cy.intercept('GET', 'https://api.languagetoolplus.com/v2/languages', {
        statusCode: 200,
        body: [
          { name: 'English' },
          { name: 'Spanish' },
          { name: 'French (Canadian)' },
        ],
      }).as('getLanguages');

      // Stub Backend POST
      cy.intercept('POST', 'https://binarybandits-profileapi.onrender.com/api/profile', {
        statusCode: 200,
        body: { success: true, message: 'Profile created' },
      }).as('postProfile');

      cy.visit('/pages/onboarding.html');
    });

    it('should load all dynamic data correctly (languages, timezone)', () => {
      cy.wait('@getLanguages');
      cy.get('#languages option').should('have.length', 4);
      cy.get('#languages').contains('French').should('exist');
      cy.get('#detectedLocation').should('contain.text', 'Suggested region: North America (Eastern)');
      cy.get('#region').should('have.value', 'North America (Eastern)');
    });

    it('should allow searching and selecting from the custom region dropdown', () => {
      cy.get('#region').focus();
      cy.get('#regionOptions').should('be.visible');
      cy.get('#region').clear().type('asia');
      
      // Note: Your regions array has 5 Asia regions
      cy.get('.dropdown-option[style*="display: block"]').should('have.length', 5); 
      
      cy.get('.dropdown-option').contains('Asia (Southern)').click();
      cy.get('#region').should('have.value', 'Asia (Southern)');
      cy.get('#regionOptions').should('not.be.visible');
    });

    it('should submit the full form and redirect on success', () => {
      cy.get('#languages').select('Spanish');
      cy.get('#region').clear().type('Africa (Western)');
      cy.get('#ageRange').select('25-34');
      cy.get('#gender').select('Female');
      cy.get('#hobbies').select('Cooking');
      cy.get('#bio').type('This is a test bio for Cypress.');

      cy.get('button[type="submit"]').click();

      cy.wait('@postProfile').its('request.body').should('deep.include', {
        region: 'Africa (Western)',
        ageRange: '25-34',
        gender: 'female',
        bio: 'This is a test bio for Cypress.',
        languages: ['spanish'],
        hobbies: ['cooking'],
      });

      cy.get('@alertStub').should('be.calledWith', 'Profile created successfully 🎉');
      cy.get('@locationStub').its('href').should('eq', './userdashboard.html');
    });

    it('should show an error alert if the submission fails', () => {
      cy.intercept('POST', '**/api/profile', {
        statusCode: 500,
        body: { error: 'Server exploded' },
      }).as('postProfileFail');

      cy.get('#languages').select('English');
      cy.get('#region').select('UK(GMT+1)');
      cy.get('#ageRange').select('45+');
      cy.get('#gender').select('Non-binary');
      cy.get('#bio').type('This test will fail.');

      cy.get('button[type="submit"]').click();
      cy.wait('@postProfileFail');

      cy.get('@alertStub').should('be.calledWith', 'Error saving profile. Please try again.');
      cy.get('@locationStub').its('href').should('eq', ''); // No redirect
    });
  });
});