"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/withdraws";

export {
  post
};

async function post( {
  params: { id },
  body: { failMessage },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

  if( typeof failMessage !== "string" || failMessage === "" )
    return res.error( 13 );

  const transaction = await pool.connect();

  await transaction.query( "begin" );

  const { rows: [ row ] } = await transaction.query(
    `select status
    from withdraws
    where id = $1`,
    [ id_ ]
  );

  if( row === undefined ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Invalid withdraw ID (${id_})`
    } );
  }

  if( row.status !== "process" ){
    await transaction.query( "rollback" );
    transaction.release();

    return res.json( {
      ok: false,
      message: `Withdraw status must be "process" (found "${row.status}")`
    } );
  }

  const { rows: withdrawActions } = await transaction.query(
    `select action_id, amount
    from withdraw_actions
    where withdraw_id = $1`,
    [ id_ ]
  );

  for( let { action_id, amount } of withdrawActions ) await transaction.query(
    `update actions
    set balance = balance + $1
    where id = $2`,
    [ amount, action_id ]
  );

  // #fix localize
  await edit( transaction, id_, "rejected", failMessage );
  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
