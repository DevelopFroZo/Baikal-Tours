"use strict";

import fetch from "node-fetch";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export async function post( req, res ){
  const { actionId, price, name } = req.body;

  if(
    typeof actionId !== "number" || actionId < 0 ||
    typeof price !== "number" || price < 0 ||
    name === null || typeof name !== "object" || Array.isArray( name )
  ) res.error( 13 );

  let translated = {};

  translated[ name.locale ] = name.text;

  if( name.autoTranslate === true ){
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );

    translator.add( "name", name.text, name.locale, name.toLocales );
    await translator.translate();

    translated = { ...translated, ...translator.translated.name };
  }

  const { transaction, id: actionTicketId } = await req.database.actionTickets.create( actionId, price );

  for( let locale in translated )
    await req.database.actionTicketsTranslates.create( transaction, actionTicketId, locale, translated[ locale ] );

  await transaction.end();

  res.success( 0, actionTicketId );

  res.error();
}
