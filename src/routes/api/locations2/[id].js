"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/locations2";

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

  const result = await edit( pool, id, name );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}

async function del( req, res ){}
