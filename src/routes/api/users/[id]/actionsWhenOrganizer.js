"use strict";

import { toInt } from "/helpers/converters";
import { createMap, mergeSingle, mergeMultiple } from "/helpers/merger";

export async function get( {
  session: { isLogged, locale, role, userId },
  params,
  body: { userId: userId_ },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const id = toInt( params.id );

  if( typeof id !== "number" || id < 1 )
    return res.error( 13 );

  if( role !== "admin" && id !== userId )
    return res.error( 12 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: actions } = await transaction.query(
    `select
      a.id, at.name,
      null as locations,
      null as dates,
      null as buyable
    from
    	actions as a,
      actions_translates as at
    where
    	at.locale = $1 and
    	not array_position( a.organizer_ids, $2 ) is null and
    	a.id = at.action_id`,
    [ locale, id ]
  );

  const map = createMap( actions, "id" );
  const actionIds = Object.keys( map );

  const { rows: locations } = await transaction.query(
    `select al.action_id, l.name, al.address
    from
    	actions_locations as al,
      locations as l
    where
    	l.locale = $1 and
      al.location_id = l.id and
      al.action_id = any( $2 )`,
    [ locale, actionIds ]
  );

  const { rows: dates } = await transaction.query(
    `select
    	action_id, date_start, date_end,
      time_start, time_end, days
    from action_dates as ad
    where ad.action_id = any( $1 )`,
    [ actionIds ]
  );

  const { rows: buyable } = await transaction.query(
    `select
    	id as action_buyable_id,
      action_id, price, type,
      null as count
    from action_buyable
    where action_id = any( $1 )`,
    [ actionIds ]
  );

  const buyableMap = createMap( buyable, "action_buyable_id" );
  const actionBuyableIds = Object.keys( buyableMap );

  const { rows: buyableCount } = await transaction.query(
    `select
    	ar.paid, arb.action_buyable_id,
      sum( arb.count )::int as count
    from
    	action_reservations as ar,
      action_reservations_buyable as arb
    where
    	arb.action_buyable_id = any( $1 ) and
      ar.id = arb.action_reservation_id
    group by ar.paid, arb.action_buyable_id`,
    [ actionBuyableIds ]
  );

  await transaction.query( "commit" );
  transaction.release();

  mergeMultiple( actions, locations, "action_id", "locations", { remove: true, map } );
  mergeMultiple( actions, dates, "action_id", "dates", { remove: true, map } );
  mergeSingle( buyable, buyableCount, "action_buyable_id", "count", { remove: true, buyableMap } );
  mergeMultiple( actions, buyable, "action_id", "buyable", { remove: true, map } );

  res.success( 0, actions );
}
