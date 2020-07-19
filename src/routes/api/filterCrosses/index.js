"use strict";

import fetch from "node-fetch";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";
import Translator from "/helpers/translator/index";
import {
  createOne,
  getMany
} from "/database/filterCrosses";

export {
  post,
  get
};

async function post( {
  body: { slug, description, intro },
  database: { pool }
}, res ){
  if(
    typeof slug !== "string" || slug === "" ||
    description === null || typeof description !== "object" || Array.isArray( description ) ||
    intro === null || typeof intro !== "object" || Array.isArray( intro )
  ) return res.error( 13 );

  const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
  const translator = new Translator( yandexEngine );
  const translated = {};

  const q = ( locale, field, source ) => {
    if( !( locale in translated ) )
      translated[ locale ] = {};

    translated[ locale ][ field ] = source;
  };

  q( description.locale, "description", description.text );
  q( intro.locale, "intro", intro.text );

  if( description.autoTranslate )
    translator.add( "description", description.text, description.locale, description.toLocales );

  if( intro.autoTranslate )
    translator.add( "intro", intro.text, intro.locale, intro.toLocales );

  await translator.translate();
  translator.transform();

  for( let key in translator.transformed )
    if( translated[ key ] !== undefined )
      translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
    else
      translated[ key ] = translator.transformed[ key ];

  const client = await pool.connect();

  await client.query( "begin" );

  const result = await createOne( client, slug, translated );

  if( typeof result === "string" ){
    await client.query( "rollback" );
    client.release();

    return res.json( { errors: [ result ] } );
  }

  await client.query( "commit" );
  client.release();

  res.success( 0, result );
}

async function get( {
  session: { role, locale },
  query: { allLocales },
  database: { pool }
}, res ){
  if( allLocales !== undefined && role === "admin" )
    locale = false;

  const result = await getMany( pool, locale );

  res.success( 0, result );
}
