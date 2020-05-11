"use strict";

import { toInt } from "/helpers/converters";
import { create, getAll } from "/database/locations2";

export {
  post,
  get
};

async function post( {
  body: { name, id },
  database: { pool }
}, res ){
  if( typeof name !== "string" || name === "" )
    return res.error( 13 );

  const id_ = toInt( id );

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await create( client, name, id_ );

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
  database: { pool }
}, res ){
  // #fix localise
  const result = await getAll( pool );

  res.success( 0, result );
}
