<script>
  import { onMount } from 'svelte';

  const meetings = [
    {
      title: 'Mr Selix',
      description:
        'Morning Tasks.  Could be anything.  Add links here too.  http://www.example.com',
      startTimeHour: 5, // 24 hour format
      startTimeMinute: 25,
      lengthInMinutes: 1, // minutes
      days: [1, 3, 5], // 0-6 Sunday-Saturday
      meetingUrl: 'http://foo.com',
    },
  ];

  function getStartAndEndTimeInMs(meetingArg) {
    const currentStartTimeInMilleseconds = getMeetingStartTimeToday(
      meetingArg.startTimeHour,
      meetingArg.startTimeMinute
    ).valueOf();
    const currentEndTimeInMilleseconds =
      currentStartTimeInMilleseconds + meetingArg.lengthInMinutes * 60 * 1000;
    return [currentStartTimeInMilleseconds, currentEndTimeInMilleseconds];
  }

  function getCurrentMeeting(nowArg, meetingsArg) {
    const nowInMilleseconds = Date.now();
    for (let i = 0; i < meetingsArg.length; i++) {
      const current = meetingsArg[i];
      const [
        currentStartTimeInMilleseconds,
        currentEndTimeInMilleseconds,
      ] = getStartAndEndTimeInMs(current);
      if (
        nowInMilleseconds >= currentStartTimeInMilleseconds &&
        nowInMilleseconds <= currentEndTimeInMilleseconds
      ) {
        return current;
      }
    }
  }

  function getDateZeroedToMinutes() {
    let date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
  function getMeetingStartTimeToday(hour, minute) {
    let date = getDateZeroedToMinutes();
    date.setHours(hour);
    date.setMinutes(minute);
    return date;
  }
  function getShortTime(date) {
    return date.toLocaleString('en-US', { timeStyle: 'short' });
  }
  function getDayOfTheWeek(date) {
    return date.toLocaleString('en-US', { weekday: 'long' });
  }

  let intervalId;
  let now = getDateZeroedToMinutes();
  let minutesLeft = 0;
  $: if (meeting) {
    const [, currentEndTimeInMilleseconds] = getStartAndEndTimeInMs(meeting);
    minutesLeft = Math.floor(
      (currentEndTimeInMilleseconds - getDateZeroedToMinutes().valueOf()) /
        60000
    );
  }
  let meeting = getCurrentMeeting(now, meetings);
  onMount(() => {
    intervalId = setInterval(() => {
      now = getDateZeroedToMinutes();
      const maybeMeeting = getCurrentMeeting(now, meetings);
      meeting = maybeMeeting ? { ...maybeMeeting } : maybeMeeting;
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  });
</script>

<style>
</style>

<svelte:head>
  <title>Tinsey | Where am I supposed to be rn?</title>
</svelte:head>

<section class="section p-0 is-fullwidth">
  <div class="hero">
    <div class="hero-body has-background-info-light has-text-centered">
      <div class="container">
        <h1 class="title is-family-sans-serif m-0" style="font-size: 4rem;">
          Where am I supposed to be rn? 🤔
        </h1>
      </div>
    </div>
  </div>
</section>
<div class="container is-max-widescreen">
  <section class="section">
    <nav class="level is-mobile is-family-code has-text-grey">
      <div class="level-left">
        <div class="level-item">
          <p class="content is-size-3">{getDayOfTheWeek(now)}</p>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <p class="content is-size-3">{getShortTime(now)}</p>
        </div>
      </div>
    </nav>
    <div class="container">
      {#if !meeting}
        <h1 class="title is-1 has-text-centered">Free!</h1>
      {:else}
        <div class="card">
          <div class="card-header has-background-info-light p-3">
            <div class="card-header-title is-centered">
              <h1 class="title is-1 m-0">{meeting.title}</h1>
            </div>
          </div>
          <div
            class="card-content has-text-centered has-text-light has-background-grey p-1"
          >
            <div class="columns">
              <div class="column">
                <p class="content is-size-3">
                  Starts at
                  {getShortTime(getMeetingStartTimeToday(meeting.startTimeHour, meeting.startTimeMinute))}
                </p>
              </div>
              <div class="column">
                <p class="content is-size-3">
                  is
                  {meeting.lengthInMinutes}
                  minutes long
                </p>
              </div>
              <div class="column">
                <p class="content is-size-3 is-italic">
                  there's
                  {minutesLeft}
                  minutes left
                </p>
              </div>
            </div>
          </div>
          <div class="card-content has-text-centered">
            <p class="content is-size-4 m-6">
              {@html meeting.description}
            </p>
          </div>

          <div class="card-footer">
            <div class="card-footer-item">
              <a
                class="button is-large is-link"
                href="{meeting.meetingUrl}"
                target="_blank"
                rel="noreferrer"
                style="height: unset;"
              ><h1 class="is-1 m-1">Join Meeting</h1></a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
