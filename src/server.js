import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import fs from 'fs';
import { FileLoader } from './loaders.js';

const PORT = 3000;

const typeDefs = `
  union FSNode = Directory | File

  type Directory {
    name: String
    path: String
    subdirectories(regEx: String): [Directory]
    files(regEx: String): [File]
  }

  type File {
    name: String
    path: String
    content: String
    size: Int
  }

  type Permission {
    read: Boolean
    write: Boolean
    execute: Boolean
  }

  type Query {
    file(path: String): File
    dir(path: String): Directory
  }
`;

const resolvers = {

    Directory: {
        files(dir){
          return dir.files();
        },
        //TODO: this resolver threw an error, but I had no idea where
        // it came from. That's not good.
        subdirectories(dir){
          return dir.subdirectories();
        },
      },
      File: {
        content(file){
          // return fs readfile
          return file.read();
        },
    
        size(file){
          return file.stats().then( stats => stats.size );
        },
      },
      Query: {
        file( obj, { path }){
          const fl = new FileLoader();
          return fl.openFile(path);
          // get file info and pass it to file
        },
        dir(obj, { path }){
          // get the directory info at that path and pass it to dir
          const fl = new FileLoader();
          return fl.openDir(path);
        }
      },
      /* Mutation: {
        createFile( obj, { dirPath, name, content }){
          //fs create file, return file
        },
        updateFile( obj, { filePath, newContent }){
          //fs read file, return file
        },
        deleteFile( obj, { filePath }){
          //fs delete file, return success
        },
    
        mkdir( obj, { firPath, name }){
          // make directory and return it
        },
        rmdir( obj, { dirPath }){
          // remove directory and return it
        },
      }*/
  };

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });  

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});