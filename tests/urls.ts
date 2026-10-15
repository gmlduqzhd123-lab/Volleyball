export const APP_PORT = Number(process.env.VOLLEYBALL_TEST_PORT ?? 5183);
export const BUILD_PORT = Number(process.env.VOLLEYBALL_BUILD_PORT ?? 5184);
if (![APP_PORT, BUILD_PORT].every(port => Number.isInteger(port) && port >= 1024 && port <= 65535) || APP_PORT === BUILD_PORT) {
  throw Error('Use two different valid ports for the volleyball test servers.');
}
export const APP_URL = `http://127.0.0.1:${APP_PORT}/`;
export const BUILD_URL = `http://127.0.0.1:${BUILD_PORT}/volleyball/`;
