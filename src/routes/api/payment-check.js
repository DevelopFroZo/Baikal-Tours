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
    const { rows: [ { name, surname, form_url: formUrl } ] } = await pool.query(
      `select name, surname, form_url
      from action_reservations
      where order_id = $1`,
      [ orderId ]
    );

    if( OrderStatus === 2 ) await pool.query(
      `update action_reservations
      set
        paid = true,
        form_url = null
      where order_id = $1`,
      [ orderId ]
    );
    else if( OrderStatus === 7 ) await pool.query(
      `update action_reservations
      set form_url = null
      where order_id = $1`,
      [ orderId ]
    );

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
