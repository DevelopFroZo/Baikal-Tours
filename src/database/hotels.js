"use strict";

import { toInt, toFloat } from "/helpers/converters";

export async function getAll( client, count, offset, search, locationIds, bookingLocationIds ){
  let filters = [];
  const params = [];
  let i = 1;
  let count_ = 0;

  count !== null ? count = `limit ${count}` : count = "";
  offset !== null ? offset = `offset ${offset}` : offset = "";

  if( search !== null ){
    filters.push( `h.name ilike any( $${i++} )` );
    params.push( search );
  }

  if( locationIds !== null ){
    filters.push( `h.location_id = any( $${i++} )` );
    params.push( locationIds );
  }

  if( bookingLocationIds !== null ){
    filters.push( `h.booking_location_id = any( $${i++} )` );
    params.push( bookingLocationIds );
  }

  if( filters.length > 0 )
    filters = `${filters.join( " and ")} and`;
  else
    filters = "";

  const { rowCount, rows } = await client.query(
    `select
      h.id, h.booking_url, h.location_id, h.name, h.image_url, h.price, h.rating,
      bl.id as booking_location_id,
      bl.name as booking_location_name,
      count( 1 ) over ()
    from
      hotels as h,
      booking_locations as bl
    where
      ${filters}
      h.booking_location_id = bl.id
    order by id
    ${count}
    ${offset}`,
    params
  );

  if( rowCount > 0 ){
    count_ = rows[0].count;
    rows.forEach( row => delete row.count );
  }

  return {
    hotels: rows,
    count: count_
  };
}

// #fix изменить фотографию
export async function edit( client, id, { bookingUrl, bookingLocationId, locationId, name, price, rating } ){
  let sets = [];
  const params = [ id ];
  let i = 2;

  locationId = toInt( locationId );
  price = toInt( price );
  rating = toFloat( rating );

  if( typeof bookingUrl === "string" && bookingUrl !== "" ){
    sets.push( `booking_url = $${i++}` );
    params.push( bookingUrl );
  }

  if( typeof bookingLocationId === "string" && bookingLocationId !== "" ){
    sets.push( `booking_location_id = $${i++}` );
    params.push( bookingLocationId );
  }

  if( locationId !== null && locationId > 0 ){
    sets.push( `location_id = $${i++}` );
    params.push( locationId );
  }

  if( typeof name === "string" && name !== "" ){
    sets.push( `name = $${i++}` );
    params.push( name );
  }

  if( price !== null && price > 0 ){
    sets.push( `price = $${i++}` );
    params.push( price );
  }

  if( rating !== null && rating >= 1 && rating <= 10 ){
    sets.push( `rating = $${i++}` );
    params.push( rating );
  }

  if( sets.length > 0 ){
    sets = sets.join( "," );

    await client.query(
      `update hotels
      set ${sets}
      where id = $1`,
      params
    );
  }
}

export async function remove( client, id ){
  await client.query(
    `delete from hotels
    where id = $1`,
    [ id ]
  );
}
