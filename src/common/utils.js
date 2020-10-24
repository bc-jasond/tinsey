function saneEnvironmentOrExit(...requiredVars) {
  const { env } = process;
  const missingEnvVariables = requiredVars.filter((key) => !env[key] && key);
  if (missingEnvVariables.length > 0) {
    console.error(
      `❌ process.env not sane!\n\nThe following variables are missing:\n${missingEnvVariables.join(
        '\n'
      )}`
    );
    process.exit(1);
  }
}

function isBrowser() {
  return typeof window !== 'undefined';
}

module.exports = {
  saneEnvironmentOrExit,
  isBrowser,
};
