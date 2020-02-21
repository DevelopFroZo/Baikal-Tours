function mustAdminStatic( req, res, next ){
  if( !req.session.isAdmin )
    return res.redirect( `/login?redirect=${req.path}` );

  next();
}

function mustAdminAPI( req, res, next ){
  if( !req.session.isAdmin )
    return res.error( 12 );

  next();
}

export default ( server ) => {
  // Static
  server.get( "/admin*", mustAdminStatic );

  // API
  server.get( "/api/users", mustAdminAPI );

  server.post( "/api/actions", mustAdminAPI );
  server.put( "/api/actions/:id", mustAdminAPI );
  server.delete( "/api/actions/:id", mustAdminAPI );
};
