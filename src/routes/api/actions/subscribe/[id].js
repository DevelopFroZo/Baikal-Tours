export async function post( req, res ){
  const result = await req.database.actions.getOneForEmail( req.params.id );

  if( result === null ) return res.error( 9 );

  const contact_faces = result.contact_faces ? result.contact_faces : [];
  const emails = result.emails ? result.emails : [];
  const phones = result.phones ? result.phones : [];
  const maxCount = Math.max( Math.max( contact_faces.length, emails.length ), phones.length );
  let contacts = [];
  let price;

  for( let i = 0; i < maxCount; i++ ){
    contacts[i] = [];

    if( contact_faces[i] !== undefined )
      contacts[i].push( contact_faces[i] );
    if( emails[i] !== undefined )
      contacts[i].push( emails[i] );
    if( phones[i] !== undefined )
      contacts[i].push( phones[i] );

    contacts[i] = contacts[i].join( ", " );
  }

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
