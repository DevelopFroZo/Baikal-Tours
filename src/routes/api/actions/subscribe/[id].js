"use strict";

import { contactsToString } from "/helpers/converters";

export async function post( req, res ){
  const result = await req.database.actions.getOneForEmail( req.params.id, req.session.locale );

  if( result === null ) return res.error( 9 );

  let contacts = contactsToString( result.contact_faces, result.emails, result.phones );
  let price;

  contacts = contacts.join( "\n" );

  if( contacts === "" ) contacts = ` ${req._( "no_contacts" )}`;
  else contacts = "\n" + contacts;

  if( result.price_min === 0 ){
    if( result.price_max === 0 ) price = req._( "money.free" );
    else price = `${req._( "money.free" )} - ${result.price_max} ${req._( "money.rub" )}`;
  }
  else price = `${result.price_min} - ${result.price_max} ${req._( "money.rub" )}`;

  let emailSubscribeText = req._( "email.subscribe.text" );

  emailSubscribeText = emailSubscribeText.replace( "{user}", req.body.name );
  emailSubscribeText = emailSubscribeText.replace( "{name}", result.name );
  emailSubscribeText = emailSubscribeText.replace( "{short_description}", result.short_description );
  emailSubscribeText = emailSubscribeText.replace( "{contacts}", contacts );
  emailSubscribeText = emailSubscribeText.replace( "{price}", price );

  req.mail.send(
    req.body.email,
    // #fix нормальная тема
    req._( "email.subscribe.subject" ),
    // #fix нормальный текст
    emailSubscribeText
  );

  res.success();
}
