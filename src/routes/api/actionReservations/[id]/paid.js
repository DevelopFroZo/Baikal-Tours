"use strict";

import { toInt } from "/helpers/converters";

export async function post( {
  session: { isLogged, role, userId },
  params,
  body: { userId: userId_ },
  database: { pool }
}, res ){
  isLogged = true;

  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id = toInt( params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  if( role !== "admin" && userId !== userId_ )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  //

  await transaction.query( "commit" );
  await transaction.release();

  res.success();
}
