
query {
  dir(path: "./test/")
  { 
    path name,
    files { name }, subdirectories { name }
  } 
}

npm install

npm start

http://localhost:3000/graphiql/
