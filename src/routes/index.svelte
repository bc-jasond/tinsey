<script>
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
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
</style>

<svelte:head>
  <title>Tinsey | Where am I supposed to be rn?</title>
</svelte:head>

<section class="section p-0 is-fullwidth">
  <div class="hero">
    <div class="hero-body p-2 has-background-info-light has-text-centered">
      <div class="container">
        <h1 class="title is-family-sans-serif m-0 open-nav" style="font-size: 4rem;" on:dblclick={() => $shouldShowNav = !$shouldShowNav}>
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
          <p class="content is-size-3">Today is {getDayOfTheWeek(now)}</p>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <p class="content is-size-3">it's {getShortTime(now)}</p>
        </div>
      </div>
    </nav>
    <div class="container">
      {#if !meeting}
        <div in:fly={{y:200, duration:250, delay: 150}} out:fade={{duration:200}} class="card">
          <div class="card-content has-text-centered">
            <h1 class="title" style="font-size: 5rem;">Free 🕊️</h1>
          </div>
        </div>
      {:else}
        <div in:fly={{y:200, duration:250, delay:150}} out:fade={{duration:200}} class="card">
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
