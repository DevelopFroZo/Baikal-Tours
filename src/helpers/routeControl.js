"use strict";

import multer from "multer";

const upload = multer();
const dev = process.env.NODE_ENV === "development";

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

  // Documentation
  if( !dev ) server.get( "/docs*", ( req, res ) => res.redirect( "/404" ) );

  // API
  server.get( "/api/users", secureAPI( "admin" ) );
  server.delete( "/api/users/:id", secureAPI( "admin" ) );

  server.post( "/api/actions", secureAPI( "admin" ) );
  server.put( "/api/actions/:id", secureAPI( "admin" ) );

  server.post( "/api/actionImages", secureAPI( "admin" ), upload.array( "images" ) );
  server.put( "/api/actionImages/:id", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/actionImages/:id", secureAPI( "admin" ) );

  server.post( "/api/actionPartners", secureAPI( "admin" ), upload.single( "image" ) );
  server.put( "/api/actionPartners/:id", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/actionPartners/:id", secureAPI( "admin" ) );

  server.post( "/api/actionsExcursions", secureAPI( "admin" ) );
  server.put( "/api/actionsExcursions", secureAPI( "admin" ) );
  server.delete( "/api/actionsExcursions", secureAPI( "admin" ) );

  server.post( "/api/actionsTours", secureAPI( "admin" ) );
  server.put( "/api/actionsTours", secureAPI( "admin" ) );
  server.delete( "/api/actionsTours", secureAPI( "admin" ) );

  server.post( "/api/compiliations", secureAPI( "admin" ) );
  server.post( "/api/compiliations/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  // #fix добавить PUT, DELETE

  server.post( "/api/companions", secureAPI( "admin" ) );
  server.put( "/api/companions/:id", secureAPI( "admin" ) );
  server.delete( "/api/companions/:id", secureAPI( "admin" ) );

  server.post( "/api/subjects", secureAPI( "admin" ) );
  server.put( "/api/subjects/:id", secureAPI( "admin" ) );
  server.delete( "/api/subjects/:id", secureAPI( "admin" ) );

  server.post( "/api/transfers", secureAPI( "admin" ) );
  server.put( "/api/transfers/:id", secureAPI( "admin" ) );
  server.delete( "/api/transfers/:id", secureAPI( "admin" ) );

  server.post( "/api/favorites", secureAPI( "admin" ) );
  server.put( "/api/favorites/:id", secureAPI( "admin" ) );
  server.delete( "/api/favorites/:id", secureAPI( "admin" ) );

  server.post( "/api/excursions", secureAPI( "admin" ) );
  server.post( "/api/excursions/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  // #fix добавить PUT, DELETE

  server.post( "/api/tours", secureAPI( "admin" ) );
  server.post( "/api/excursions/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  // #fix добавить PUT, DELETE
};
