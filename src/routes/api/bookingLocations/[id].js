"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/bookingLocations";

export {
  put
};

async function put( {
  params: { id },
  body: { location2Id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( !Number.isInteger( location2Id ) || location2Id < 1 )
    return res.error( 13 );

  const result = await edit( pool, id, location2Id );

  if( result !== true )
    return res.json( { errors: [ result ] } );

  res.success();
}
