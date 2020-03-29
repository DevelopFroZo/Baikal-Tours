"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function post( req, res ){
  const { name, site, date_start, date_end, locationId } = req.body;
  let { price } = req.body;
  let translated = {};

  if(
    typeof name !== "object" || Array.isArray( name ) ||
    typeof site !== "string" || site === "" ||
    typeof date_start !== "string" || date_start === "" ||
    typeof date_start !== "string" || date_end === "" ||
    typeof locationId !== "number" || locationId < 1
  ) return res.error( 13 );

  translated[ name.locale ] = name.text;

  if( name.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", name.text, name.locale, name.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  if( typeof price !== "number" || price < 1 )
    price = null;

  const { transaction, id } = await req.database.excursions.create( site, date_start, date_end, locationId, price );

  for( let locale in translated )
    await req.database.excursionsTranslates.create( transaction, id, locale, translated[ locale ] );

  await transaction.end();

  res.success( 0, id );
}
