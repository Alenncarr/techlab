describe('Jornada no sistema web', () => {
  const email = 'jornada@example.test';

  beforeEach(() => {
    cy.request({
      method: 'DELETE',
      url: '/api/oficinas/1/inscricoes',
      qs: { email },
      failOnStatusCode: false,
    });
  });

  it('registra catálogo, busca, inscrição, consulta e cancelamento', () => {
    cy.visit('/');
    cy.get('#total-oficinas').should('have.text', '4');
    cy.get('#oficinas article').should('have.length', 4);
    cy.screenshot('04-catalogo-completo-web');

    cy.get('#busca').type('Docker');
    cy.get('#oficinas article').should('have.length', 1);
    cy.get('#oficinas').should('contain.text', 'Docker na prática');
    cy.screenshot('05-busca-web');
    cy.get('#busca').clear();

    cy.get('#trilha').select('Engenharia');
    cy.get('#oficinas article').should('have.length', 2);
    cy.screenshot('06-filtro-web');
    cy.get('#trilha').select('');

    cy.get('[data-cy="oficina-1"]').within(() => {
      cy.get('input').type(email);
      cy.contains('button', 'Reservar vaga').click();
    });
    cy.get('[role="status"]').should('have.text', 'Inscrição confirmada.');
    cy.screenshot('07-inscricao-web');

    cy.reload();
    cy.get('[data-cy="oficina-1"] [data-cy="vagas"]')
      .should('have.text', '1 de 2 vagas ocupadas');
    cy.screenshot('08-persistencia-web');

    cy.get('#consultar input[name="email"]').type(email);
    cy.get('#consultar button').click();
    cy.get('#reservas li').should('have.length', 1);
    cy.get('#reservas').should('contain.text', 'Docker na prática');
    cy.screenshot('09-consulta-web');

    cy.get('#reservas button').click();
    cy.get('#retorno-consulta').should('have.text', 'Inscrição cancelada.');
    cy.get('#reservas li').should('have.length', 0);
    cy.get('[data-cy="oficina-1"] [data-cy="vagas"]')
      .should('have.text', '0 de 2 vagas ocupadas');
    cy.screenshot('10-cancelamento-web');
  });
});
