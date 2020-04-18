"use strict";

import { transliterate } from "transliteration";
import { toInt } from "/helpers/converters";
import { getById, edit, remove } from "/database/hotels";

export async function get( {
  params,
  database: { pool },
  session: { locale }
}, res ){
  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const data = await getById( pool, id );

  if( locale !== "ru" ){
    data.name = transliterate( data.name );
    data.booking_location_name = transliterate( data.booking_location_name );
  }

  res.success( 0, data );
}

export async function put( {
  params, body,
  database: { pool }
}, res ){
  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  // #fix изменить фотографию
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
