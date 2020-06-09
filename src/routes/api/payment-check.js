"use strict";

import fetch from "node-fetch";
import { getOrderStatus } from "/helpers/sber/acquiring/index";

export {
  get
};

async function get( {
  session: { isLogged },
  query: { orderId },
  database: { pool }
}, res ){
  if( !isLogged ) return res.json( {
    ok: false,
    message: "Unauthorized"
  } );

  const {
    ErrorCode,
    ErrorMessage,
    OrderStatus,
    OrderStatusMessage,
    OrderNumber
  } = await getOrderStatus( fetch, {
    userName: process.env.SBER_ACQUIRING_USERNAME,
    password: process.env.SBER_ACQUIRING_PASSWORD,
    orderId,
    // #fix localize
    language: "ru"
  } );

  if( typeof ErrorCode === "string" ){
    if( ErrorCode === "6" )
      return res.json( {
        ok: false,
        message: `Reservation with order ID (${orderId}) not found`
      } );

    console.log( `[PAYMENT] ${ErrorCode} ${ErrorMessage}` );

    return res.json( { status: 502, message: "See server logs" } );
  }

  if( OrderStatus === 0 || OrderStatus === 2 || OrderStatus === 7 ){
    const transaction = await pool.connect();

    await transaction.query( "begin" );

    const { rows: [ {
      action_id: actionId,
      name,
      surname,
      form_url: formUrl,
      paid,
      amount
    } ] } = await transaction.query(
      `select
      	ar.action_id, ar.name, ar.surname, ar.form_url, ar.paid,
        sum( ab.price * arb.count )::int as amount
      from
      	action_reservations as ar,
        action_reservations_buyable as arb,
        action_buyable as ab
      where
      	order_id = $1 and
        ar.id = arb.action_reservation_id and
        arb.action_buyable_id = ab.id
      group by ar.action_id, ar.name, ar.surname, ar.form_url, ar.paid`,
      [ orderId ]
    );

    if( OrderStatus === 2 && !paid ){
      await transaction.query(
        `update action_reservations
        set
          paid = true,
          form_url = null
        where order_id = $1`,
        [ orderId ]
      );

      await transaction.query(
        `update actions
        set balance = balance + $1
        where id = $2`,
        [ amount, actionId ]
      );
    }
    else if( OrderStatus === 7 ) await transaction.query(
      `update action_reservations
      set form_url = null
      where order_id = $1`,
      [ orderId ]
    );

    await transaction.query( "commit" );
    transaction.release();

    return res.json( {
      ok: true,
      data: {
        orderStatus: OrderStatus,
        orderStatusMessage: OrderStatusMessage,
        name,
        surname,
        formUrl
      }
    } );
  }

  console.log( `[PAYMENT CHECK] ${OrderStatus} ${OrderStatusMessage}` );

  return res.json( { status: 502, message: "See server logs" } );
}
