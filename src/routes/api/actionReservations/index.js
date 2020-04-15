"use strict";

import isValidActionDate from "/helpers/isValidActionDate";
import { create, getByUserId } from "/database/actionReservations";
import { toInt } from "/helpers/converters";

export async function post( req, res ){
  const { userId, actionId, name, surname, phone, email } = req.body;
  let { date, buyable } = req.body;

  if( !req.session.isLogged )
    return res.json( {
      ok: false,
      message: "Unauthorized"
    } );

  if(
    typeof userId !== "number" || userId < 1 ||
    typeof actionId !== "number" || actionId < 1 ||
    typeof name !== "string" || name === "" ||
    typeof surname !== "string" || surname === "" ||
    typeof phone !== "string" || phone === "" ||
    typeof email !== "string" || email === "" ||
    typeof date !== "string" || date === ""
  ) return res.error( 13 );

  if( req.session.role !== "admin" && userId !== req.session.userId )
    return res.error( 12 );

  date = new Date( date );

  const transaction = await req.database.pool.connect();

  await transaction.query( "begin" );

  const actionDates = await req.database.actionDates.getByActionId( transaction, actionId );

  for( let actionDate of actionDates )
    if( !isValidActionDate( actionDate, date ) ){
      await transaction.query( "rollback" );
      await transaction.release();

      return res.error( 18 );
    }

  if(
    !Array.isArray( buyable ) ||
    buyable.length === 0 ||
    !buyable.every( el => el !== null && !Array.isArray( el ) && typeof el === "object" )
  ) buyable = null;

  const result = await create( req.database.pool, userId, actionId, name, surname, phone, email, date, buyable );

  await transaction.query( "commit" );
  await transaction.release();

  res.success();
}

export async function get( {
  session: { isLogged, locale, userId, role },
  query,
  database: { pool }
}, res ){
  // if( !isLogged ) return res.json( {
  //   ok: false,
  //   message: "Unauthorized"
  // } );

  const userId_ = toInt( query.userId );

  if( typeof userId_ !== "number" || userId_ < 1 )
    return res.error( 13 );

  // if( role !== "admin" && userId !== userId_ )
  //   return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const reservations = await getByUserId( transaction, userId_ );
  const actionIds = [];
  const actionReservationsIds = [];

  reservations.forEach( reservation => {
    actionIds.push( reservation.action_id );
    actionReservationsIds.push( reservation.action_reservation_id );
    reservation.locations = [];
    reservation.dates = [];
    reservation.buyable = [];
  } );

  const { rows: locations } = await transaction.query(
    `select al.action_id, l.name, al.address
    from
    	actions_locations as al,
      locations as l
    where
    	l.locale = $1 and
    	action_id = any( $2 ) and
      al.location_id = l.id`,
    [ locale, actionIds ]
  );

  const { rows: dates } = await transaction.query(
    `select action_id, date_start, date_end, time_start, time_end, days
    from action_dates
    where action_id = any( $1 )`,
    [ actionIds ]
  );

  const { rows: buyable } = await transaction.query(
    `select arb.action_reservation_id, arb.count, ab.price, ab.type, abt.name
    from
    	action_reservations_buyable as arb,
      action_buyable as ab,
      action_buyable_translates as abt
    where
    	abt.locale = $1 and
    	action_reservation_id = any( $2 ) and
      arb.action_buyable_id = ab.id and
      ab.id = abt.action_buyable_id`,
    [ locale, actionReservationsIds ]
  );

  const merge = ( obj0, obj1, byKey, newKey, options ) => {
    if(
      options === null ||
      Array.isArray( options ) ||
      typeof options !== "object"
    ) options = {};

    let { map } = options;
    const { remove } = options;

    if( map === undefined ){
      map = {};

      obj0.forEach( ( field, i ) => {
        const mapKey = field[ byKey ];

        if( !( mapKey in map ) )
          map[ mapKey ] = [];

        map[ mapKey ].push( i );
      } );
    }

    obj1.forEach( field => {
      const indexes = map[ field[ byKey ] ];

      indexes.forEach( index => {
        const field_ = obj0[ index ];

        // if( remove === true )
        //   delete field[ byKey ];

        field_[ newKey ].push( field );
      } );
    } );
  };

  merge( reservations, locations, "action_id", "locations", { remove: true } );
  merge( reservations, dates, "action_id", "dates", { remove: true } );
  merge( reservations, buyable, "action_reservation_id", "buyable", { remove: true } );

  await transaction.query( "commit" );
  await transaction.release();

  res.success( 0, reservations );
}
