"use strict";

import pg from "pg";
import config from "../configs/database";
import codes from "./codes";

const dev = process.env.NODE_ENV === "development";
const modules = {};

// Main pool
modules.pool = new pg.Pool( !dev ? config.production : config.development );

// Controllers

// Success & error functions
modules.success = ( code, data ) => {
  if( data === undefined ) data = null;
  if( code === undefined ) code = 0;

  return {
    ok : true,
    code,
    message : codes.successes[ code ],
    data
  };
};
modules.error = code => {
  if( code === undefined ) code = 0;

  return {
    ok : false,
    code,
    message : codes.errors[ code ]
  };
};

export default modules;
