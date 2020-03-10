"use strict";

import multer from "multer";

const upload = multer();

function secureStatic( roles ){
  if( typeof roles === "string" )
    roles = [ roles ];

  return ( req, res, next ) => {
    if( !roles.includes( req.session.role ) )
      return res.redirect( `/login?redirect=${req.path}` );

    next();
  }
}

function secureAPI( roles ){
  if( typeof roles === "string" )
    roles = [ roles ];

  return ( req, res, next ) => {
    if( !roles.includes( req.session.role ) )
      return res.error( 12 );

    next();
  }
}

export default ( server ) => {
  // Static
  // server.get( "/img/actions/*", ( req, res, next ) => res.sendFile( req.path, { root: "./static" }, err => next() ) );
  server.get( "/admin*", secureStatic( "admin" ) );

  // API
  server.get( "/api/users", secureAPI( "admin" ) );
  server.delete( "/api/users/:id", secureAPI( "admin" ) );

  server.post( "/api/actions", secureAPI( "admin" ) );
  server.put( "/api/actions/:id", secureAPI( "admin" ) );

  server.post( "/api/actionImages", secureAPI( "admin" ), upload.array( "images" ) );
  server.put( "/api/actionImages/:id", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/actionImages/:id", secureAPI( "admin" ) );
};
