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

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const result = await edit( transaction, id, body );

  if( result !== true ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( result );
  }

  await transaction.query( "commit" );
  transaction.release();

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
