"use strict";

import { toInt, toIntArray } from "/helpers/converters";

export {
  post,
  get
};

async function post( req, res ){
  const subjectId = toInt( req.body.subjectId );
  const actionId = toInt( req.body.actionId );
  let before = toInt( req.body.before );

  if(
    typeof subjectId !== "number" || subjectId < 1 ||
    typeof actionId !== "number" || actionId < 1
  ) return res.error( 13 );

  if( typeof before !== "number" || before < 1 )
    before = null;

  res.json( await req.database.favorites.create( subjectId, actionId, before ) );
}

async function get( {
  session: { locale },
  query: { subjectIds },
  database: { favorites }
}, res ){
  const subjectIds_ = toIntArray( subjectIds );
  const result = await favorites.get( locale, subjectIds_ );

  res.success( 0, result );
}
