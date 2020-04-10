"use strict";

import { toInt } from "/helpers/converters";

// Errors: 9, 10
export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const role = req.session.role;
  let locale = req.session.locale;
  let allStatuses = false;

  if( role === "admin" ){
    if( req.query.locale ) locale = req.query.locale;

    allStatuses = true;
  }

  res.json( await req.database.actions.getOne( allStatuses, id, locale ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  await req.database.actions.edit( id, req.body );

  res.success();
}
