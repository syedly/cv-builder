export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Must run before any mongoose import. System DNS blocks MongoDB SRV queries;
    // override to public resolvers at process startup.
    const { setServers } = await import('node:dns');
    setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  }
}
