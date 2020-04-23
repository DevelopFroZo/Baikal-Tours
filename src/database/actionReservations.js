"use strict";

export async function create( client, userId, actionId, name, surname, phone, email, date, buyable ){
  const { rows: [ { id } ] } = await client.query(
    `insert into action_reservations( user_id, action_id, name, surname, phone, email, date )
    values( $1, $2, $3, $4, $5, $6, $7 )
    returning id`,
    [ userId, actionId, name, surname, phone, email, date ]
  );

  if( buyable !== null ){
    const params = [ id ];
    let i = 2;

    buyable = buyable.filter( el => Number.isInteger( el.count ) && el.count > 0 );
    buyable = buyable.map( ( { actionBuyableId, count } ) => {
      params.push( actionBuyableId );
      params.push( count );

      return `($1,$${i++},$${i++})`;
    } ).join( "," );

    if( params.length > 1 ) await client.query(
      `insert into action_reservations_buyable( action_reservation_id, action_buyable_id, count )
      values ${buyable}`,
      params
    );
  }

  return id;
}

export async function getByUserId( client, userId ){
  const { rows } = await client.query(
    `select
      ar.id as action_reservation_id, ar.paid, ar.date,
      at.action_id, at.name
    from
      action_reservations as ar,
      actions_translates as at
    where
      at.locale = 'ru' and
      ar.action_id = at.action_id`
  );

  return rows;
}
