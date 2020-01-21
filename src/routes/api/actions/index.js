import { toInt, toIntArray } from "../_helpers/converters";

// Errors: 6, 7, 8
export async function get( req, res ){
  const filter = req.query.filter;
  const count = toInt( req.query.count );

  if( count !== null && count < 1 )
    return res.error( 6 );

  // Errors: 6
  if( filter === undefined )
    return res.json( await req.database.actions.getAll( count ) );

  // filter is sended
  // Errors: 7, 8
  let dateStart = req.query.dateStart;
  let dateEnd = req.query.dateEnd;
  let locations = toIntArray( req.query.locations );
  let companions = toIntArray( req.query.companions );
  let subjects = toIntArray( req.query.subjects );
  const price_min = toInt( req.query.priceMin );
  const price_max = toInt( req.query.priceMax );

  if( dateStart === undefined ) dateStart = null;
  else if( dateStart === "" )
    return res.error( 7 );

  if( dateEnd === undefined ) dateEnd = null;
  else if( dateEnd === "" )
    return res.error( 7 );

  if( price_min < 0 || price_max < 0 )
    return res.error( 8 );

  res.json( await req.database.actions.filter(
    dateStart,
    dateEnd,
    locations,
    companions,
    subjects,
    price_min,
    price_max,
    count
  ) );
}
