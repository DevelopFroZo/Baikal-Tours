"use strict";

import multer from "multer";

const upload = multer();

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
  // server.get( "/img/actions/*", ( req, res, next ) => res.sendFile( req.path, { root: "./static" }, err => next() ) );
  server.get( "/admin*", mustAdminStatic );

  // API
  server.get( "/api/users", mustAdminAPI );

  server.post( "/api/actions", mustAdminAPI );
  server.put( "/api/actions/:id", mustAdminAPI );

  server.post( "/api/actionImages", mustAdminAPI, upload.array( "images" ) );
  server.put( "/api/actionImages/:id", mustAdminAPI, upload.single( "image" ) );
  server.delete( "/api/actionImages/:id", mustAdminAPI );
};
