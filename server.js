const { createApp } = require('./src/app');

const { app, port } = createApp();

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
});
