"use strict";

import { getAll } from "/database/bookingLocations";

export {
  get
};

async function get( {
  query: { location2name },
  database: { pool }
}, res ){
  if( typeof location2name === "string" )
    location2name = true;

  // #fix localise
  res.success( 0, await getAll( pool, location2name ) );
}
