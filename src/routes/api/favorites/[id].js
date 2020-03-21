"use strict";

import { toInt } from "/helpers/converters";

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { number } = req.body;
  let { action } = req.body;

  if( action !== "before" && action !== "after" )
    action = "before";

  res.json( await req.database.favorites.edit( id, number, action ) );
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  res.json( await req.database.favorites.delete( id ) );
}
