"use strict";

const app = require("./app");
const { PORT } = require("./config");

const path = require('path')
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))
// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
