"use strict";

export async function get( req, res ){
  req.session.isLogged = false;
  req.session.isAdmin = false;

  res.redirect( "/" );
}
