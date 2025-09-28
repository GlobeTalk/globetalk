describe('GlobeTalk Onboarding Page', () => {
  beforeEach(() => {
    cy.visit('onboarding.html'); // adjust path if needed
  });

  it('displays the correct page title and header', () => {
    cy.title().should('eq', 'GlobeTalk - Create Your Profile');
    cy.get('header h1').should('contain.text', 'GlobeTalk');
    cy.get('header p.subtitle').should('contain.text', 'Create your anonymous profile');
  });

  it('shows Profile Information section', () => {
    cy.get('section[aria-labelledby="profile-info"]').should('exist');
    cy.get('section[aria-labelledby="profile-info"] h2').should('contain.text', 'Profile Information');
  });

  it('shows Personal Info section', () => {
    cy.get('section[aria-labelledby="personal-info"]').should('exist');
    cy.get('section[aria-labelledby="personal-info"] h2').should('contain.text', 'Personal Info');
  });

  it('populates select options', () => {
    // Wait for languages to populate asynchronously
    cy.get('#languages', { timeout: 10000 }).should('not.be.empty');
    cy.get('#region').should('not.be.empty');
    cy.get('#ageRange').should('not.be.empty');
    cy.get('#gender').should('not.be.empty');
    cy.get('#hobbies').should('not.be.empty');
  });

  it('detects user timezone and suggests region', () => {
    cy.get('#detectedLocation', { timeout: 5000 })
      .should('contain.text', 'Detected timezone');
    cy.get('#region').invoke('val').should('not.be.empty');
  });

  it('allows entering data into inputs', () => {
    cy.get('#languages').select(1);
    cy.get('#region').select(1);
    cy.get('#ageRange').select(1);
    cy.get('#gender').select(1);
    cy.get('#hobbies').select(1);
    cy.get('#threeWords').type('Curious and fun');
  });

  it('submits form and redirects to dashboard', () => {
    // Stub window.location.href to catch redirect
    cy.window().then((win) => {
      cy.stub(win.location, 'href').as('redirect');
    });

    // Fill inputs first
    cy.get('#languages').select(1);
    cy.get('#region').select(1);
    cy.get('#ageRange').select(1);
    cy.get('#gender').select(1);
    cy.get('#hobbies').select(1);
    cy.get('#threeWords').type('Curious and fun');

    cy.get('button[type="submit"]').click();
    cy.get('@redirect').should('be.calledWith', 'index.html');
  });
});
