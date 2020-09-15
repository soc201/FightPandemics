const auth0 = require("./auth0");

Cypress.Commands.add('login', async (email, password) => { 
    // const { body } = req;
    // const { email, password } = body;
    try {
      const token = await auth0.authenticate("password", {
        password,
        scope: "openid",
        username: email,
      });
      console.log(token)
    }
      catch (err) {
      }
});