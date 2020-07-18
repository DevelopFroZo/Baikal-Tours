"use strict";

import { toInt } from "/helpers/converters";
import { create, getAll } from "/database/locations2";

export {
  post,
  get
};

async function post( {
  body: { name, id, isChild },
  database: { pool }
}, res ){
  if( typeof name !== "string" || name === "" )
    return res.error( 13 );

  const id_ = toInt( id );

  if( typeof isChild !== "boolean" )
    isChild = false;

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await create( client, name, id_, isChild );

  if( typeof result === "string" ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success( 0, result );
}

async function get( {
  session: { locale },
  query: { ln, bln },
  database: { pool }
}, res ){
  ln = typeof ln === "string" ? true : false;
  bln = typeof bln === "string" ? true : false;

  const result = await getAll( pool, locale, ln, bln );

  res.success( 0, result );
}
