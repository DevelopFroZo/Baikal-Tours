"use strict";

import pg from "pg";
import config from "../configs/database";
import codes from "./codes";

const dev = process.env.NODE_ENV === "development";
const modules = {};

import Auth from "./auth";
import Actions from "./actions";
import Locations from "./locations";
import Companions from "./companions";
import Subjects from "./subjects";
import DataForFilters from "./dataForFilters";
import Users from "./users";

// Main pool
modules.pool = new pg.Pool( !dev ? config.production : config.development );

// Controllers
modules.auth = new Auth( modules );
modules.actions = new Actions( modules );
modules.locations = new Locations( modules );
modules.companions = new Companions( modules );
modules.subjects = new Subjects( modules );
modules.dataForFilters = new DataForFilters( modules );
modules.users = new Users( modules );

// #fix вынести на глобальный уровень
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
