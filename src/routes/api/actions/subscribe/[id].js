// #fix придумать что-то с путём
import { contactsToString } from "../../../../helpers/converters";

export async function post( req, res ){
  const result = await req.database.actions.getOneForEmail( req.params.id );

  if( result === null ) return res.error( 9 );

  let contacts = contactsToString( result.contact_faces, result.emails, result.phones );
  let price;

  contacts = contacts.join( "\n" );

  if( contacts === "" ) contacts = " нет";
  else contacts = "\n" + contacts;

  if( result.price_min === 0 ){
    if( result.price_max === 0 ) price = "бесплатно";
    else price = `бесплатно - ${result.price_max} руб.`;
  }
  else price = `${result.price_min} - ${result.price_max} руб.`;

  req.mail.send(
    req.body.email,
    // #fix нормальная тема
    "Регистрация на событие",
    // #fix нормальный текст
    `Здравствуйте, ${req.body.name}, вы зарегистрировались на событие ${result.name}\n\n` +
    `${result.short_description}\n\n` +
    `Контакты мероприятия:${contacts}\n\n` +
    `Цена: ${price}`
  );

  res.success();
}
