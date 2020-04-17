"use strict";

import { toInt } from "/helpers/converters";
import { edit, remove } from "/database/hotels";

export async function put( {
  params, body,
  database: { pool }
}, res ){
  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  await edit( pool, id, body );

  return res.success();
}

export async function del( {
  params,
  database: { pool }
}, res ){
  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  await remove( pool, id );

  return res.success();
}
