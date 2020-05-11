"use strict";

export {
  getAll,
  edit
};

async function getAll( client ){
  const { rows } = await client.query(
    `select *
    from booking_locations
    order by id`
  );

  return rows;
}

async function edit( client, id, location2Id ){
  try{
    const { rowCount } = await client.query(
      `update booking_locations
      set location2_id = $1
      where id = $2`,
      [ location2Id, id ]
    );

    if( rowCount === 0 )
      return `Invalid ID (${id})`;

    return true;
  } catch( e ) {
    if( e.code === "23503" )
      return `Invalid location2 ID (${location2Id})`;

    throw e;
  }
}
