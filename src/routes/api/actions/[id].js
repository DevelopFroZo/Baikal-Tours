"use strict";

import { toInt } from "/helpers/converters";

// Errors: 9, 10
export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  // #fix локаль для адреса локации
  res.json( await req.database.actions.getOne( id, req.session.locale ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const status = req.body.status;

  req.database.actions.edit( id, status );

  res.success();
}
