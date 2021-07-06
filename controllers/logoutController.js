'use strict';

const logout = function (req, res) { // Logout by destroying the session 
  req.session.destroy();
  res.redirect('/login?logout=true')
}

module.exports = {logout}