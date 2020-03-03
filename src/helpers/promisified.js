import {
  writeFile as fsWriteFile,
  unlink as fsUnlink
} from "fs";

export function writeFile( path, data ){
  return new Promise( ( res, rej ) => {
    fsWriteFile( path, data, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}

export function unlink( path ){
  return new Promise( ( res, rej ) => {
    fsUnlink( path, err => {
      if( err ) rej( err );
      else res();
    } );
  } );
}
