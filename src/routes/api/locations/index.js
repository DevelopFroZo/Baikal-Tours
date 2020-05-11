"use strict";

export {
  get
};

async function get( {
  session: { locale },
  query: { location2name },
  database: { locations }
}, res ){
  if( typeof location2name === "string" )
    location2name = true;

  res.json( await locations.getAll( locale, location2name ) );
}
