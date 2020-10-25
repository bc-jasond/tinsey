<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  import { isUrl } from '../common/utils';
  import { currentGoogleUser, shouldShowNav } from '../stores';

  function getStartAndEndTimeInMs(meetingArg) {
    const currentStartTimeInMilleseconds = getMeetingStartTimeToday(
      meetingArg.startTimeHour,
      meetingArg.startTimeMinute
    ).valueOf();
    const currentEndTimeInMilleseconds =
      currentStartTimeInMilleseconds + meetingArg.lengthInMinutes * 60 * 1000;
    return [currentStartTimeInMilleseconds, currentEndTimeInMilleseconds];
  }
  function getCurrentMeeting(nowInMilleseconds, meetingsArg) {
    for (let i = 0; i < meetingsArg.length; i++) {
      const current = meetingsArg[i];
      const [
        currentStartTimeInMilleseconds,
        currentEndTimeInMilleseconds,
      ] = getStartAndEndTimeInMs(current);
      if (
        nowInMilleseconds >= currentStartTimeInMilleseconds &&
        nowInMilleseconds < currentEndTimeInMilleseconds
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
  function getDate(date) {
    return date.toLocaleString('en-US', { dateStyle: 'long' });
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

  let meetingsForToday = [];
  async function getTodaysMeetings(token) {
    const response = await fetch(
      `/schedule/${token}?dayOfWeek=${now.getDay()}`
    );
    const meetings = await response.json();
    //console.log("Today's Meetings", meetings);
    meetingsForToday = meetings;
  }

  $: if ($currentGoogleUser) {
    getTodaysMeetings($currentGoogleUser.idToken);
  } else {
    meetingsForToday = [];
  }

  let meeting = getCurrentMeeting(now, meetingsForToday);
  onMount(() => {
    intervalId = setInterval(() => {
      now = getDateZeroedToMinutes();
      const maybeMeeting = getCurrentMeeting(now, meetingsForToday);
      meeting = maybeMeeting ? { ...maybeMeeting } : maybeMeeting;
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  });
</script>

<style>
  .open-nav {
    cursor: pointer;
  }
  @keyframes blink {
    from,
    to {
      color: #7a7a7a;
    }
    50% {
      color: transparent;
    }
  }
  .blink {
    animation: 1.5s blink step-end infinite;
  }
</style>

<svelte:head>
  <title>Tinsey | Where am I supposed to be rn?</title>
</svelte:head>

<section class="section p-0 is-fullwidth">
  <div class="hero">
    <div class="hero-body p-2 has-background-info-light has-text-centered">
      <div class="container">
        <h1
          class="title is-family-sans-serif m-0 open-nav"
          title="Double-click me to show/hide the menu bar above..."
          style="font-size: 3rem;"
          on:dblclick="{() => ($shouldShowNav = !$shouldShowNav)}"
        >
          Where am I supposed to be rn? 🤔
        </h1>
      </div>
    </div>
  </div>
</section>
<div class="container is-max-widescreen">
  <section class="section">
    <nav class="level is-family-code has-text-grey">
      <div class="level-left">
        <div class="level-item">
          <span class="content is-size-3">Today is
            <em>{getDayOfTheWeek(now)}</em><br />{getDate(now)}</span>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <span class="content is-size-3 mb-0">it's
            {getShortTime(now).split(':')[0]}</span>
          <span class="content is-size-3 mb-0 blink">:</span>
          <span
            class="content is-size-3"
          >{getShortTime(now).split(':')[1]}</span>
        </div>
      </div>
    </nav>
    <div class="container">
      {#if !meeting}
        <div
          in:fly|local="{{ y: 200, duration: 250, delay: 150 }}"
          out:fade|local="{{ duration: 200 }}"
          class="card"
        >
          <div class="card-content has-text-centered">
            <h1 class="title" style="font-size: 5rem;">Free 🕊️</h1>
          </div>
        </div>
      {:else}
        <div
          in:fly|local="{{ y: 200, duration: 250, delay: 150 }}"
          out:fade|local="{{ duration: 200 }}"
          class="card"
        >
          <div class="card-header has-background-info-light p-3">
            <div class="card-header-title is-centered">
              <h1 class="title m-0" style="font-size: 5rem;">
                {meeting.title}
              </h1>
            </div>
          </div>
          <div class="card-content has-text-centered">
            <h2 class="subtitle m-0 is-1">{meeting.subTitle}</h2>
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
                  minute{meeting.lengthInMinutes !== 1 ? 's' : ''}
                  long
                </p>
              </div>
              <div class="column">
                <p class="content is-size-3 is-italic">
                  there's
                  {minutesLeft}
                  minute{minutesLeft !== 1 ? 's' : ''}
                  left
                </p>
              </div>
            </div>
          </div>
          <div class="card-content has-text-centered">
            <p class="content is-size-4 m-6">
              {@html meeting.description}
            </p>
          </div>
          <div class="card-footer p-5">
            <div class="card-footer-item">
              {#if isUrl(meeting.meetingUrl)}
                <a
                  class="button is-large is-link"
                  href="{meeting.meetingUrl}"
                  target="_blank"
                  rel="noreferrer"
                  style="height: unset;"
                ><h1 class="is-1 m-1">Join Meeting</h1></a>
              {:else}
                <span
                  class="button is-large is-static"
                  style="height: unset;"
                ><h1 class="is-1 m-1">No (or invalid) Meeting Link</h1></span>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</div>
