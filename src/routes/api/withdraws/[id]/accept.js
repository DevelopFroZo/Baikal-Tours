"use strict";

import { toInt } from "/helpers/converters";
import { edit } from "/database/withdraws";

export {
  get
};

async function get( {
  params: { id },
  database: { pool }
}, res ){
  const id_ = toInt( id );

  if( id_ === null || id_ < 1 )
    return res.error( 9 );

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

  await edit( transaction, id_, "accepted" );
  await transaction.query( "commit" );
  transaction.release();

  res.success();
}
