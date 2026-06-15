import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[Server] Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`[Server] Presiona Ctrl+C para detener el servidor`);
});
