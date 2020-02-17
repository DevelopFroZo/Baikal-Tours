"use strict";

import { toInt, toIntArray } from "/helpers/converters";

// Errors: 6, 7, 8
export async function get( req, res ){
  const locale = req.session.locale;
  const filter = req.query.filter;
  const count = toInt( req.query.count );
  const offset = toInt( req.query.offset );
  let actions;
  let actionsCount;

  if( count !== null && count < 1 )
    return res.error( 6 );

  // Errors: 6
  if( filter === undefined )
    actions = ( await req.database.actions.getAll( locale, count, offset ) ).data;
  else{
    // Filters is sended
    // Errors: 7, 8
    let dateStart = req.query.dateStart;
    let dateEnd = req.query.dateEnd;
    let locations = toIntArray( req.query.locations );
    let companions = toIntArray( req.query.companions );
    let subjects = toIntArray( req.query.subjects );
    const priceMin = toInt( req.query.priceMin );
    const priceMax = toInt( req.query.priceMax );

    if( dateStart === undefined ) dateStart = null;
    else if( dateStart === "" )
      return res.error( 7 );

    if( dateEnd === undefined ) dateEnd = null;
    else if( dateEnd === "" )
      return res.error( 7 );

    if( priceMin < 0 || priceMax < 0 )
      return res.error( 8 );

    actions = ( await req.database.actions.filter(
      locale,
      dateStart,
      dateEnd,
      locations,
      companions,
      subjects,
      priceMin,
      priceMax,
      count,
      offset
    ) ).data;
  }

  if( actions.length > 0 ){
    actionsCount = parseInt( actions[0].count );

    actions.forEach( action => {
      delete action.count;
    } );
  }
  else actionsCount = 0;

  res.json( { actions, count: actionsCount } );
}
