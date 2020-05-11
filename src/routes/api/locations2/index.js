"use strict";

import { toInt } from "/helpers/converters";
import { create, getAll } from "/database/locations2/index";

export {
  post,
  get
};

async function post( {
  body: { name, id },
  database: { pool }
}, res ){
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
  const result = await getAll( pool );

  res.success( 0, result );
}
