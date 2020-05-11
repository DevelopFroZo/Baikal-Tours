"use strict";

import { getAll } from "/database/bookingLocations";

export {
  get
};

async function get( {
  database: { pool }
}, res ){
  // #fix localise
  res.success( 0, await getAll( pool ) );
}
