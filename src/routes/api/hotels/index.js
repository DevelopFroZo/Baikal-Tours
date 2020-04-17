"use strict";

import { toInt, toIntArray, toFloat } from "/helpers/converters";
import { getAll } from "/database/hotels";

export async function get( {
  query,
  database: { pool }
}, res ){
  let count = toInt( query.count );
  let offset = toInt( query.offset );
  let { search } = query;
  let locationIds = toIntArray( query.locationIds );
  let bookingLocationIds = toIntArray( query.bookingLocationIds );

  if( typeof search === "string" && search !== "" )
    search = search.split( "," ).map( el => `%${el}%` );
  else
    search = null;

  res.json( await getAll( pool, count, offset, search, locationIds, bookingLocationIds ) );
}
