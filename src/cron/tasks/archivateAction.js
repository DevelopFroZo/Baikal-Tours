"use strict";

import { Pool } from "pg";
import databaseConfigs from "/configs/database";

export default index;

async function index( { actionId } ){
  try{
    console.debug( `[TASK ARCHIVATE ACTION] Start archivate (${actionId})` );

    const pool = new Pool( databaseConfigs[ process.env.NODE_ENV ] );

    await pool.query(
      `update actions
      set status = 'archive'
      where id = $1`,
      [ actionId ]
    );
  } catch( e ) {
    console.error( e );

    return false;
  }
}
