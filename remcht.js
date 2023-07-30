// If "remember me" is checked
if (req.body.rememberMe) {
    // Generate a persistent identifier (e.g., token)
    const token = generateToken();

    // Store the token in the session
    req.session.token = token;

    // Set a long-lived cookie containing the token
    res.cookie('remember_me', token, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
  }

// If the user is not authenticated in the session
if (!req.session.isAuthenticated) {
  // Check for remember-me cookie
  const rememberMeToken = req.cookies.remember_me;

  // If the remember-me token exists
  if (rememberMeToken) {
    // Authenticate the user using the token
    const user = authenticateUserWithToken(rememberMeToken);

    if (user) {
      // Store user information in the session
      req.session.isAuthenticated = true;
      req.session.user = user;
    }
  }
}

next();