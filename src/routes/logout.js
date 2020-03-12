"use strict";

export async function get( req, res ){
  req.session.isLogged = false;
  req.session.role = "user";

  delete req.session.userId;
  delete req.session.name;
  delete req.session.email;

  res.redirect( "/" );
}
