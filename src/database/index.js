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
import CompiliationDates from "./compiliationDates";
import Compiliations from "./compiliations";
import CompiliationsActions from "./compiliationsActions";
import CompiliationsLocations from "./compiliationsLocations";
import CompiliationsSubjects from "./compiliationsSubjects";
import CompiliationsTranslates from "./compiliationsTranslates";
import Excursions from "./excursions";
import ExcursionsTranslates from "./excursionsTranslates";
import Favorites from "./favorites";
import Subjects from "./subjects";
import Transfers from "./transfers";
import DataForFilters from "./dataForFilters";
import Users from "./users";
import ActionsTranslates from "./actionsTranslates";
import ActionDates from "./actionDates";
import ActionImages from "./actionImages";
import ActionPartners from "./actionPartners";
import ActionsCompanions from "./actionsCompanions";
import ActionsExcursions from "./actionsExcursions";
import ActionsLocations from "./actionsLocations";
import ActionsSubjects from "./actionsSubjects";
import ActionsTransfers from "./actionsTransfers";

// Main pool
modules.pool = new pg.Pool( !dev ? config.production : config.development );

// Controllers
modules.auth = new Auth( modules );
modules.actions = new Actions( modules );
modules.locations = new Locations( modules );
modules.companions = new Companions( modules );
modules.compiliationDates = new CompiliationDates( modules );
modules.compiliations = new Compiliations( modules );
modules.compiliationsActions = new CompiliationsActions( modules );
modules.compiliationsLocations = new CompiliationsLocations( modules );
modules.compiliationsSubjects = new CompiliationsSubjects( modules );
modules.compiliationsTranslates = new CompiliationsTranslates( modules );
modules.excursions = new Excursions( modules );
modules.excursionsTranslates = new ExcursionsTranslates( modules );
modules.favorites = new Favorites( modules );
modules.subjects = new Subjects( modules );
modules.transfers = new Transfers( modules );
modules.dataForFilters = new DataForFilters( modules );
modules.users = new Users( modules );
modules.actionsTranslates = new ActionsTranslates( modules );
modules.actionDates = new ActionDates( modules );
modules.actionImages = new ActionImages( modules );
modules.actionPartners = new ActionPartners( modules );
modules.actionsCompanions = new ActionsCompanions( modules );
modules.actionsExcursions = new ActionsExcursions( modules );
modules.actionsLocations = new ActionsLocations( modules );
modules.actionsSubjects = new ActionsSubjects( modules );
modules.actionsTransfers = new ActionsTransfers( modules );

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
