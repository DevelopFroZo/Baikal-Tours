"use strict";

import { toInt } from "/helpers/converters";

// Errors: 9, 10
export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.actions.getOne( id, req.session.locale ) );
}
