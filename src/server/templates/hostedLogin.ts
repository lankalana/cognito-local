export const hostedLoginTemplate = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Cognito Local - Login</title>
  </head>
  <body>
    <h1>Sign in</h1>
    <form method="post" action="/oauth2/authorize">
      <input type="hidden" name="client_id" value="__CLIENT_ID__" />
      <input type="hidden" name="redirect_uri" value="__REDIRECT_URI__" />
      <input type="hidden" name="response_type" value="__RESPONSE_TYPE__" />
      <input type="hidden" name="state" value="__STATE__" />
      <input type="hidden" name="scope" value="__SCOPE__" />

      <label>Username: <input name="username" /></label>
      <br />
      <label>Password: <input name="password" type="password" /></label>
      <br />
      <button type="submit">Sign in</button>
    </form>
  </body>
</html>
`;
