<script>
  import { onDestroy } from 'svelte';
  import { currentGoogleUser } from '../stores';

  const meetingTemplate = {
    id: '', // not used yet
    title: '',
    subTitle: '',
    description: '',
    startTimeHour: undefined, // 24 hour format
    startTimeMinute: undefined,
    lengthInMinutes: undefined, // minutes
    days: [], // 0-6 Sunday-Saturday
    meetingUrl: '',
  };

  let meeting = meetingTemplate;

  const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

  let schedule = '';
  async function getSchedule(token) {
    const response = await fetch(`/schedule/${token}`);
    schedule = await response.json();
  }

  const currentGoogleUserDeregister = currentGoogleUser.subscribe((u) => {
    if (u) {
      getSchedule(u.idToken);
    }
  });

  onDestroy(() => {
    currentGoogleUserDeregister();
  });

  function updateDayOfWeek(idx) {
    meeting.days[idx] = !meeting.days[idx];
  }

  async function saveMeeting() {}
</script>

<style>
  pre {
    max-height: 400px;
    overflow: auto;
    white-space: pre-wrap;
  }
  .time-separator-container {
    width: 10px;
    display: flex;
    flex-grow: 0;
    align-items: flex-end;
  }
  .time-separator {
    font-weight: bold;
    padding: 10px 0;
  }
</style>

<svelte:head>
  <title>About</title>
</svelte:head>

<div class="columns">
  <div class="column">
    <h1>schedule</h1>
    <pre>{JSON.stringify(schedule, undefined, 2)}</pre>
  </div>
  <div class="column">
    <h1>meeting</h1>
    <pre>{JSON.stringify(meeting, undefined, 2)}</pre>
  </div>
</div>
<div class="container is-max-widescreen">
  <section class="section">
    <h1>Setup your schedule</h1>

    <!--    <label class="label ">Meeting id</label>-->
    <!--    <div class="field has-addons">-->
    <!--      <div class="control">-->
    <!--        <input class="input" type="text" placeholder="A unique identifier" bind:value={meeting.id}/>-->
    <!--      </div>-->
    <!--      <div class="control"><a class="button is-info"> Generate </a></div>-->
    <!--    </div>-->

    <div class="field">
      <label class="label">Title</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Meeting Title"
          bind:value="{meeting.title}"
        />
      </div>
    </div>

    <div class="field">
      <label class="label">Subtitle</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="Meeting Subtitle"
          bind:value="{meeting.subTitle}"
        />
      </div>
    </div>

    <div class="field">
      <label class="label">Description</label>
      <div class="control">
        <textarea
          class="textarea"
          rows="6"
          placeholder="Meeting Description"
          bind:value="{meeting.description}"
        ></textarea>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <label class="label">Days of the Week</label>
        <div class="field has-addons">
          {#each daysOfWeek as day, idx}
            <div class="control">
              <a
                class="button"
                class:is-info="{meeting.days[idx]}"
                on:click="{() => updateDayOfWeek(idx)}"
              >{day}</a>
            </div>
          {/each}
        </div>
      </div>

      <div class="column">
        <label class="label">Start Time Hour (0-23)</label>
        <div class="control">
          <input
            class="input"
            type="number"
            min="0"
            max="23"
            placeholder="8"
            bind:value="{meeting.startTimeHour}"
          />
        </div>
      </div>
      <div class="column time-separator-container">
        <span class="time-separator">:</span>
      </div>
      <div class="column">
        <label class="label">Start Time Minute (0-59)</label>
        <div class="control">
          <input
            class="input"
            type="number"
            min="0"
            max="59"
            placeholder="30"
            bind:value="{meeting.startTimeMinute}"
          />
        </div>
      </div>
      <div class="column">
        <label class="label">Duration in Minutes (1-1440)</label>
        <div class="control">
          <input
            class="input"
            type="number"
            min="1"
            max="1440"
            placeholder="30"
            bind:value="{meeting.lengthInMinutes}"
          />
        </div>
      </div>
    </div>

    <div class="field">
      <label class="label">Meeting Link</label>
      <div class="control">
        <input
          class="input"
          type="text"
          placeholder="https://us02web.zoom.us/j/935416062?pwd=RjlSUXZoQRYVVPd2hhaE1uMUR6UT09"
          bind:value="{meeting.meetingUrl}"
        />
      </div>
    </div>

    <div class="field is-grouped is-grouped-centered mt-5">
      <div class="control">
        <button class="button is-rounded is-large is-info">Save</button>
      </div>
      <div class="control">
        <button class="button is-rounded is-large">New</button>
      </div>
    </div>
  </section>
</div>
