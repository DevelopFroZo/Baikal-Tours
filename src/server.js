"use strict";

// Libs
import sirv from "sirv";
import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import helmet from "helmet";
import bodyParser from "body-parser";
import session from "express-session";
import pgStoreConnect from "connect-pg-simple";

// Config, database
import "./configs/env";
import database from "./database";

// Helpers
import mail from "./helpers/mail";

// Consts
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const pgStore = pgStoreConnect( session );
const server = express();

// #fix добавить логгер
// Settings
server.use(
  helmet(),
  bodyParser.json(),
  bodyParser.urlencoded( {
    extended: true
  } ),
  session( {
    cookie: {
      httpOnly: true,
      maxAge: !dev ? parseInt( process.env.SESSION_COOKIE_MAXAGE ) : null,
      secure: !dev && process.env.SESSION_COOKIE_SECURE === "true"
    },
    name: !dev ? process.env.SESSION_NAME : null,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: !dev ? process.env.SESSION_SECRET : "secret",
    store: new pgStore( {
      pool: database.pool,
      tableName: process.env.SESSION_TABLE_NAME
    } )
  } ),
  compression( {
    threshold: 0
  } )
);

// Some upgrade
server.use( ( req, res, next ) => {
  req.database = database;
  res.success = ( code, data ) => res.json( database.success( code, data ) );
  res.error = code => res.json( database.error( code ) );

  // #fix поменять на !dev
  if( dev ) req.mail = mail;

  if( !req.session.isLogged ) req.session.isLogged = false;
  if( !req.session.email ) req.session.email = "";

  next();
} );

// Run
server
  .use(
    sirv( "static", {
      dev
    } ),
    sapper.middleware( {
      session: ( req, res ) => ( {
        isLogged: req.session.isLogged,
        email: req.session.email
      } )
    } )
  )
  .listen( dev ? PORT : process.env.PRODUCTION_PORT, err => {
  	if( err ) console.log( "error", err );
  } );
