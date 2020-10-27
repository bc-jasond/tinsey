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

function isUrl(s) {
  try {
    const url = new URL(s);
    return true;
  } catch (err) {}
}

function getShortTime(date) {
  const hours = date.getHours();
  const isAm = hours < 12;
  let displayHours = hours > 12 ? hours - 12 : hours;
  displayHours = displayHours === 0 ? 12 : displayHours;
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${displayHours}:${minutes} ${isAm ? 'AM' : 'PM'}`;
}

function getDayOfTheWeek(date) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[date.getDay()];
  // TODO: inconsistent on iOS
  // date.toLocaleString('en-US', { weekday: 'long' });
}

function getDate(date) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  // TODO: inconsistent on iOS
  // date.toLocaleString('en-US', { dateStyle: 'long' });
}

module.exports = {
  saneEnvironmentOrExit,
  isBrowser,
  isUrl,
  getShortTime,
  getDayOfTheWeek,
  getDate,
};
