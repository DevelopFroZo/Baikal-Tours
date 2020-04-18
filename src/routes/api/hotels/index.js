"use strict";

import { transliterate } from "transliteration";
import { toInt, toIntArray, toFloat } from "/helpers/converters";
import { getAll } from "/database/hotels";

export async function get( {
  query,
  database: { pool },
  session: { locale }
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

  const data = await getAll( pool, count, offset, search, locationIds, bookingLocationIds );

  if( locale !== "ru" ) data.hotels = data.hotels.map( el => {
    el.name = transliterate( el.name );
    el.booking_location_name = transliterate( el.booking_location_name );

    return el;
  } );

  res.json( data );
}
