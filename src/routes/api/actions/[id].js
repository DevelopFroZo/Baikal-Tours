"use strict";

import { toInt } from "/helpers/converters";

// Errors: 9, 10
export async function get( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const isAdmin = req.session.isAdmin;
  let locale = req.session.locale;
  let getSubscribers = false;

  if( isAdmin ){
    if( req.query.locale ) locale = req.query.locale;
    if( req.query.getSubscribers !== undefined ) getSubscribers = true;
  }

  res.json( await req.database.actions.getOne( isAdmin, id, locale, getSubscribers ) );
}

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  await req.database.actions.edit( id, req.body );

  res.success();
}
