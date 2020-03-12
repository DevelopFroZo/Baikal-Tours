"use strict";

import { toInt } from "/helpers/converters";
import { writeFile, unlink } from "/helpers/promisified";

export async function put( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { name } = req.body;
  const { file } = req;
  let transaction;

  if( typeof name === "string" && name !== "" )
    transaction = await req.database.actionPartners.edit( id, name );

  if( file ){
    const { originalname, buffer, size } = file;
    const ext = originalname.slice( originalname.lastIndexOf( "." ) + 1, originalname.length );

    if(
      ( size / Math.pow( 2, 20 ) ) < 1 &&
      [ "png", "jpg", "jpeg" ].includes( ext )
    ){
      const { image_url } = await req.database.actionPartners.get( id, transaction );

      await writeFile( `static/${image_url}`, buffer );
    }
  }

  if( transaction ) await transaction.end();

  res.error();
}

export async function del( req, res ){
  const id = toInt( req.params.id );

  if( id === null || id < 1 )
    return res.error( 9 );

  const { transaction, imageUrl } = await req.database.actionPartners.delete( id );

  await unlink( `static/${imageUrl}` );
  await transaction.end();

  res.success();
}
