"use strict";

import multer from "multer";

import { access } from "/helpers/promisified";

const upload = multer();
const dev = process.env.NODE_ENV === "development";

function secureStatic( roles ){
  if( typeof roles === "string" )
    roles = [ roles ];

  return ( req, res, next ) => {
    if( !roles.includes( req.session.role ) )
      return res.redirect( "/?window=login" );

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
  server.get( "/img/:folder/*", async ( req, res, next ) => {
    const folders = [ "actions", "compiliations", "excursions", "partners", "tours", "hotels" ];

    if( !folders.includes( req.params.folder ) )
      next();

    if( await access( `./static/${req.path}` ) )
      return res.sendFile( req.path, { root: "./static" } );

    res.sendStatus( 404 );
  } );

  server.get( "/admin*", secureStatic( "admin" ) );

  // Documentation
  if( !dev ) server.get( "/docs*", ( req, res ) => res.redirect( "/404" ) );

  // API
  server.get( "/api/users", secureAPI( "admin" ) );
  server.delete( "/api/users/:id", secureAPI( "admin" ) );

  server.post( "/api/actions", secureAPI( "admin" ) );
  server.put( "/api/actions/:id", secureAPI( "admin" ) );

  server.post( "/api/actions/:id/hotels", secureAPI( "admin" ) );
  server.put( "/api/actions/:id/hotels/:hotelId", secureAPI( "admin" ) );
  server.delete( "/api/actions/:id/hotels/:hotelId", secureAPI( "admin" ) );

  server.post( "/api/actions/:id/locations2", secureAPI( "admin" ) );
  server.put( "/api/actions/:id/locations2/:location2Id", secureAPI( "admin" ) );
  server.delete( "/api/actions/:id/locations2/:location2Id", secureAPI( "admin" ) );

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

  server.post( "/api/actionBuyable", secureAPI( "admin" ) );
  server.put( "/api/actionBuyable/:id", secureAPI( "admin" ) );
  server.delete( "/api/actionBuyable/:id", secureAPI( "admin" ) );

  server.post( "/api/compiliations", secureAPI( "admin" ) );
  server.put( "/api/compiliations/:slug", secureAPI( "admin" ) );
  server.delete( "/api/compiliations/:slug", secureAPI( "admin" ) );

  server.post( "/api/compiliations/:slug/actions", secureAPI( "admin" ) );
  server.put( "/api/compiliations/:slug/actions/:id", secureAPI( "admin" ) );
  server.delete( "/api/compiliations/:slug/actions/:id", secureAPI( "admin" ) );

  server.post( "/api/compiliations/:slug/dates", secureAPI( "admin" ) );
  server.put( "/api/compiliations/:slug/dates/:id", secureAPI( "admin" ) );
  server.delete( "/api/compiliations/:slug/dates/:id", secureAPI( "admin" ) );

  server.post( "/api/compiliations/:slug/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.put( "/api/compiliations/:slug/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/compiliations/:slug/image", secureAPI( "admin" ) );

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
  server.post( "/api/favorites/main", secureAPI( "admin" ) );
  server.put( "/api/favorites/main/:id", secureAPI( "admin" ) );
  server.delete( "/api/favorites/main/:id", secureAPI( "admin" ) );

  server.post( "/api/excursions", secureAPI( "admin" ) );
  server.put( "/api/excursions/:id", secureAPI( "admin" ) );
  server.delete( "/api/excursions/:id", secureAPI( "admin" ) );
  server.post( "/api/excursions/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.put( "/api/excursions/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/excursions/:id/image", secureAPI( "admin" ) );

  server.post( "/api/tours", secureAPI( "admin" ) );
  server.put( "/api/tours/:id", secureAPI( "admin" ) );
  server.delete( "/api/tours/:id", secureAPI( "admin" ) );
  server.post( "/api/tours/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.put( "/api/tours/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/tours/:id/image", secureAPI( "admin" ) );

  server.post( "/api/hotels", secureAPI( "admin" ) );
  server.put( "/api/hotels/:id", secureAPI( "admin" ) );
  server.delete( "/api/hotels/:id", secureAPI( "admin" ) );
  server.post( "/api/hotels/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.put( "/api/hotels/:id/image", secureAPI( "admin" ), upload.single( "image" ) );
  server.delete( "/api/hotels/:id/image", secureAPI( "admin" ) );

  server.put( "/api/locations/:id", secureAPI( "admin" ) );

  server.put( "/api/bookingLocations/:id", secureAPI( "admin" ) );

  server.post( "/api/locations2", secureAPI( "admin" ) );
  server.put( "/api/locations2/:id", secureAPI( "admin" ) );
  server.delete( "/api/locations2/:id", secureAPI( "admin" ) );
};
