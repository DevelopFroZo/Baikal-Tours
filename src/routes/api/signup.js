"use strict";

// Errors: 2, 3, 4, 5
export async function post( req, res ){
  let result;

  if( req.query.action === "start" ){
    let { name, surname } = req.body;

    if(
      typeof req.body.phone !== "string" || req.body.phone === "" ||
      typeof req.body.email !== "string" || req.body.email === ""
    ) return res.json( { errors: [ "Invalid phone or email" ] } );

    if( typeof name !== "string" )
      name = "";

    if( typeof surname !== "string" )
      surname = "";

    result = await req.database.auth.signup(
      name,
      surname,
      req.body.phone,
      req.body.email
    );

    if( !result.ok ) return res.json( result );

    req.mail.send(
      req.body.email,
      // #fix нормальная тема
      req._( "email.confirm_password.subject" ),
      // #fix нормальный текст
      result.data
    );

    return res.success();
  }
  else if( req.query.action === "confirm" ){
    if(
      typeof req.body.phoneOrEmail !== "string" || req.body.phoneOrEmail === "" ||
      typeof req.body.password !== "string" || req.body.password === ""
    ) return res.json( { errors: [ "Invalid phone, email or password" ] } );

    result = await req.database.auth.signin(
      req.body.phoneOrEmail,
      req.body.password
    );

    if( !result.ok ) return res.json( result );

    req.session.isLogged = true;
    req.session.name = result.data.name;
    req.session.surname = result.data.surname;
    req.session.email = result.data.email;
    req.session.userId = result.data.userId;
    req.session.role = result.data.role;

    return res.success();
  }

  res.error( 5 );
}
