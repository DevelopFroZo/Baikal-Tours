"use strict";

import { toInt } from "/helpers/converters";
import { edit, del as del_ } from "/database/locations2";

export {
  put,
  del
};

async function put( {
  params: { id },
  body: { name },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( typeof name !== "string" || name === "" )
    return res.error( 13 );

  const result = await edit( pool, id_, name );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}

async function del( {
  params: { id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await del_( client, id_ );

  if( result !== true ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success();
}
