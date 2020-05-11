"use strict";

export {
  get
};

async function get( {
  database: { locations }
}, res ){
  res.json( await locations.getAll() );
}
