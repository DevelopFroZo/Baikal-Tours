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

// Configs
import "./configs/env";
import database from "./database";

// Consts
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const pgStore = pgStoreConnect( session );
const server = express();

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
      secure: !dev && process.env.SESSION_COOKIE_SECURE
    },
    name: !dev ? process.env.SESSION_NAME : null,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: !dev ? process.env.SESSION_SECRET : "secret",
    store: new pgStore( {
      pool: database.pool,
      tableName: process.env.SESSION_NAME
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

  next();
} );

// Run
server
  .use(
    sirv( "static", {
      dev
    } ),
    sapper.middleware()
  )
  .listen( PORT, err => {
  	if( err ) console.log( "error", err );
  } );
