describe('Oficinas TechLab', () => {
  beforeEach(() => {
    for (const [id, email] of [
      [1, 'aluno@example.test'],
      [2, 'primeiro@example.test'],
      [2, 'segundo@example.test'],
    ]) {
      cy.request({
        method: 'DELETE',
        url: `/api/oficinas/${id}/inscricoes`,
        qs: { email },
        failOnStatusCode: false,
      });
    }
  });

  it('filtra oficinas pela trilha Qualidade', () => {
    cy.visit('/');
    cy.get('#trilha').select('Qualidade');
    cy.get('#oficinas article').should('have.length', 1);
    cy.get('#oficinas').should('contain.text', 'Testes de interface com Cypress');
    cy.screenshot('01-oficinas-filtradas');
  });

  it('confirma e persiste uma inscrição e rejeita duplicidade', () => {
    cy.visit('/');
    cy.get('[data-cy="oficina-1"]').within(() => {
      cy.get('[data-cy="vagas"]').should('have.text', '0 de 2 vagas ocupadas');
      cy.get('input').type('aluno@example.test');
      cy.contains('button', 'Reservar vaga').click();
    });
    cy.get('[role="status"]').should('have.text', 'Inscrição confirmada.');
    cy.screenshot('02-inscricao-confirmada');
    cy.reload();
    cy.get('[data-cy="oficina-1"] [data-cy="vagas"]')
      .should('have.text', '1 de 2 vagas ocupadas');
    cy.get('[data-cy="oficina-1"]').within(() => {
      cy.get('input').type('aluno@example.test');
      cy.contains('button', 'Reservar vaga').click();
    });
    cy.get('[role="status"]').should('have.text', 'Este e-mail já está inscrito.');
  });

  it('não permite inscrições além da capacidade da oficina', () => {
    cy.visit('/');
    cy.get('[data-cy="oficina-2"]').within(() => {
      cy.get('input').type('primeiro@example.test');
      cy.contains('button', 'Reservar vaga').click();
    });
    cy.get('[role="status"]').should('have.text', 'Inscrição confirmada.');
    cy.get('[data-cy="oficina-2"] [data-cy="vagas"]')
      .should('have.text', '1 de 1 vagas ocupadas');
    cy.get('[data-cy="oficina-2"]').within(() => {
      cy.get('input').type('segundo@example.test');
      cy.contains('button', 'Reservar vaga').click();
    });
    cy.get('[role="status"]').should('have.text', 'Oficina lotada.');
    cy.get('[data-cy="oficina-2"] [data-cy="vagas"]')
      .should('have.text', '1 de 1 vagas ocupadas');
    cy.screenshot('03-oficina-lotada');
  });
});
