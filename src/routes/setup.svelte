<script>
  import { onDestroy, tick } from 'svelte';
  import { fade } from 'svelte/transition';

  import { currentGoogleUser, shouldShowNav } from '../stores';
  import { isUrl, getShortTime } from '../common/utils';

  const tempMeetingId = 'new';
  const meetingTemplate = {
    id: tempMeetingId, // not used yet
    title: '',
    subTitle: '',
    description: '',
    startTimeHour: undefined, // 24 hour format
    startTimeMinute: undefined,
    lengthInMinutes: undefined, // minutes
    days: [], // 0-6 Sunday-Saturday
    meetingUrl: '',
  };

  $shouldShowNav = true;

  let currentUser;
  let meeting = {};

  const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

  let titleInputDomNode;
  let schedule = {};
  let scheduleSorted = [];
  async function getSchedule(token) {
    const response = await fetch(`/schedule/${token}`);
    schedule = await response.json();
    scheduleSorted = filterAndSortSchedule(schedule);
  }

  let shouldSortAsc = true;
  function toggleSortDirection() {
    shouldSortAsc = !shouldSortAsc;
    scheduleSorted = filterAndSortSchedule(schedule);
  }
  let dayFilterSelected;
  function toggleDayFilter(idx) {
    dayFilterSelected = dayFilterSelected === idx ? undefined : idx;
    scheduleSorted = filterAndSortSchedule(schedule);
  }
  let searchFilter = '';
  function updateSearch(value) {
    searchFilter = value;
    scheduleSorted = filterAndSortSchedule(schedule);
  }
  function filterAndSortSchedule(scheduleArg) {
    let meetings = Object.values(scheduleArg);
    if (dayFilterSelected !== undefined) {
      meetings = meetings.filter(({ days }) => days[dayFilterSelected]);
    }
    if (searchFilter.length) {
      meetings = meetings.filter(({ title, subTitle, description }) =>
        [title, subTitle, description].some((haystack) =>
          haystack.toLowerCase().includes(searchFilter.toLowerCase())
        )
      );
    }
    return meetings.sort(
      (
        {
          startTimeHour: startTimeHourLeft,
          startTimeMinute: startTimeMinuteLeft,
        },
        {
          startTimeHour: startTimeHourRight,
          startTimeMinute: startTimeMinuteRight,
        }
      ) => {
        const hoursLeft = `${startTimeHourLeft}`.padStart(2, '0');
        const minutesLeft = `${startTimeMinuteLeft}`.padStart(2, '0');
        const hoursRight = `${startTimeHourRight}`.padStart(2, '0');
        const minutesRight = `${startTimeMinuteRight}`.padStart(2, '0');
        return `${hoursLeft}${minutesLeft}` < `${hoursRight}${minutesRight}`
          ? shouldSortAsc
            ? -1
            : 1
          : shouldSortAsc
          ? 1
          : -1;
      }
    );
  }

  const currentGoogleUserDeregister = currentGoogleUser.subscribe((u) => {
    if (u) {
      currentUser = u;
      getSchedule(u.idToken);
    }
  });

  onDestroy(() => {
    currentGoogleUserDeregister();
  });

  function getStartTime(meetingArg) {
    const date = new Date();
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(meetingArg.startTimeMinute);
    date.setHours(meetingArg.startTimeHour);
    return getShortTime(date);
  }
  function updateDayOfWeek(idx) {
    meeting.days[idx] = !meeting.days[idx];
  }
  async function newMeeting() {
    meeting = JSON.parse(JSON.stringify(meetingTemplate));
    scheduleSorted.push(JSON.parse(JSON.stringify(meetingTemplate)));
    await tick();
    titleInputDomNode.focus();
  }
  async function editMeeting(id) {
    meeting = JSON.parse(JSON.stringify(schedule[id]));
    await tick();
    titleInputDomNode.focus();
  }
  function cancelEdit() {
    // blow away new placeholder meeting in list
    scheduleSorted = filterAndSortSchedule(schedule);
    meeting = {};
  }
  let saveIsLoading;
  async function saveMeeting() {
    saveIsLoading = true;
    if (meeting.id === tempMeetingId) {
      meeting.id = Date.now();
    }
    schedule[meeting.id] = meeting;
    const response = await fetch(`/schedule/${currentUser.idToken}`, {
      method: 'PUT', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(schedule), // body data type must match "Content-Type" header
    });
    saveIsLoading = false;
    meeting = {};
    schedule = await response.json();
    scheduleSorted = filterAndSortSchedule(schedule);
  }
  async function deleteMeeting(id) {
    if (confirm(`Delete meeting "${schedule[id].title}"?`)) {
      saveIsLoading = true;
      delete schedule[id];
      const response = await fetch(`/schedule/${currentUser.idToken}`, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(schedule), // body data type must match "Content-Type" header
      });
      saveIsLoading = false;
      schedule = await response.json();
      scheduleSorted = filterAndSortSchedule(schedule);
    }
  }
</script>

<style>
  th {
    vertical-align: bottom;
  }
  td {
    vertical-align: middle;
  }
  th:last-of-type,
  td:last-of-type:not([colspan]) {
    text-align: center;
  }
  .edit-meeting-row > td {
    border-bottom: none;
  }
  .time-input-container input {
    width: 64px;
  }
  .time-separator {
    font-weight: bold;
    font-size: larger;
    display: inline-block;
    margin: 4px 0 0 2px;
  }
</style>

<svelte:head>
  <title>About</title>
</svelte:head>

<div class="container is-max-widescreen">
  <section class="section">
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <h1 class="title is-1">Setup your schedule</h1>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <h2 class="subtitle is-1">
            <span
              class="tag is-info p-2"
              style="font-size: 3rem; height: unset; line-height: unset;"
            >{scheduleSorted.length}</span>
            meetings
          </h2>
        </div>
      </div>
    </nav>
    <!-- Main container -->
    <nav class="level has-background-info-light p-5">
      <!-- Left side -->
      <div class="level-left">
        <div class="level-item">
          <div class="field has-addons">
            <p class="control">
              <input
                class="input"
                type="text"
                placeholder="Search Title, Subtitle or Description"
                on:input="{(e) => updateSearch(e.target.value)}"
                bind:value="{searchFilter}"
              />
            </p>
            <p class="control">
              <button class="button" on:click="{() => updateSearch('')}"><span
                  class="delete"
                ></span></button>
            </p>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="level-right">
        <div class="level-item">
          <span class="mx-2">Filter by day</span>
          <div class="field has-addons">
            {#each daysOfWeek as day, idx}
              <div class="control">
                <button
                  class="button"
                  class:is-info="{dayFilterSelected === idx}"
                  on:click="{() => toggleDayFilter(idx)}"
                >{day}</button>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </nav>
    <div class="table-container">
      <table
        class="table is-fullwidth"
        class:is-striped="{!meeting.id}"
        class:is-hoverable="{!meeting.id}"
      >
        <thead>
          <tr>
            <th>Meeting</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>
              Start Time<span
                on:click="{toggleSortDirection}"
                class="mx-2"
                style="cursor: pointer;"
              >{shouldSortAsc ? '⬇️' : '⬆️'}</span>
            </th>
            <th>Duration</th>
            <th>Days of Week</th>
            <th class="is-centered">
              <button class="button is-info" on:click="{newMeeting}">New
                <strong class="pl-2">+</strong></button>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each scheduleSorted as meetingData}
            <tr
              transition:fade|local="{{ duration: 125 }}"
              class:edit-meeting-row="{meetingData.id === meeting.id}"
              class:has-background-white-ter="{meetingData.id === meeting.id}"
            >
              <td>
                {#if meetingData.id === meeting.id}
                  <button
                    class="button is-outlined"
                    on:click="{cancelEdit}"
                  >Cancel</button>
                {:else}
                  <button
                    class="button is-info is-outlined"
                    on:click="{() => editMeeting(meetingData.id)}"
                  >Edit</button>
                {/if}
              </td>
              <td>
                {meetingData.title}{#if isUrl(meetingData.meetingUrl)}
                  <span
                    class="px-2"
                    title="Has a video conferencing link"
                  >🎥</span>
                {/if}
              </td>
              <td>{meetingData.subTitle}</td>
              <td>{getStartTime(meetingData)}</td>
              <td>{meetingData.lengthInMinutes} mins</td>
              <td>
                <div class="tags has-addons" style="flex-wrap: nowrap">
                  {#each daysOfWeek as day, idx}
                    <span
                      class="tag"
                      class:is-info="{meetingData.days[idx]}"
                    >{day}</span>
                  {/each}
                </div>
              </td>
              <td>
                <button
                  class="delete is-medium"
                  on:click="{() => deleteMeeting(meetingData.id)}"
                ></button>
              </td>
            </tr>
            {#if meetingData.id === meeting.id}
              <tr
                transition:fade|local="{{ duration: 125 }}"
                class="edit-meeting-form-row has-background-white-ter"
              >
                <td colspan="7">
                  <form
                    class="section pt-0"
                    on:submit="{saveMeeting}"
                    on:reset="{cancelEdit}"
                  >
                    <!--                <h2 class="subtitle is-2">Edit Meeting Details</h2>-->

                    <!--    <label class="label ">Meeting id</label>-->
                    <!--    <div class="field has-addons">-->
                    <!--      <div class="control">-->
                    <!--        <input class="input" type="text" placeholder="A unique identifier" bind:value={meeting.id}/>-->
                    <!--      </div>-->
                    <!--      <div class="control"><a class="button is-info"> Generate </a></div>-->
                    <!--    </div>-->

                    <div class="field">
                      <label for="meeting-title" class="label">Title</label>
                      <div class="control">
                        <input
                          id="meeting-title"
                          class="input"
                          type="text"
                          placeholder="Meeting Title"
                          bind:value="{meeting.title}"
                          bind:this="{titleInputDomNode}"
                        />
                      </div>
                    </div>

                    <div class="field">
                      <label
                        for="meeting-subtitle"
                        class="label"
                      >Subtitle</label>
                      <div class="control">
                        <input
                          id="meeting-subtitle"
                          class="input"
                          type="text"
                          placeholder="Meeting Subtitle"
                          bind:value="{meeting.subTitle}"
                        />
                      </div>
                    </div>

                    <div class="field">
                      <label
                        for="meeting-description"
                        class="label"
                      >Description</label>
                      <div class="control">
                        <textarea
                          id="meeting-description"
                          class="textarea"
                          rows="6"
                          placeholder="Meeting Description"
                          bind:value="{meeting.description}"
                        ></textarea>
                      </div>
                    </div>

                    <div class="columns">
                      <div class="column">
                        <label for="days-of-the-week" class="label">Days of the
                          Week</label>
                        <div id="days-of-the-week" class="field has-addons">
                          {#each daysOfWeek as day, idx}
                            <div class="control">
                              <button
                                type="button"
                                class="button"
                                class:is-info="{meeting.days[idx]}"
                                on:click="{() => updateDayOfWeek(idx)}"
                              >{day}</button>
                            </div>
                          {/each}
                        </div>
                      </div>

                      <div class="column time-input-container">
                        <label for="start-time-hour" class="label">Start Time
                          (24h)</label>
                        <div class="control">
                          <input
                            id="start-time-hour"
                            class="input"
                            type="number"
                            min="0"
                            max="23"
                            placeholder="8"
                            bind:value="{meeting.startTimeHour}"
                          />
                          <span class="time-separator">:</span>
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
                        <label for="meeting-duration" class="label">Duration in
                          Minutes (1-1440)</label>
                        <div class="control">
                          <input
                            id="meeting-duration"
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
                      <label for="meeting-url" class="label">Video Conferencing
                        Link (must begin with http:// or https://)</label>
                      <div class="control">
                        <input
                          id="meeting-url"
                          class="input"
                          type="text"
                          placeholder="https://us02web.zoom.us/j/935416062?pwd=RjlSUXZoQRYVVPd2hhaE1uMUR6UT09"
                          bind:value="{meeting.meetingUrl}"
                        />
                      </div>
                    </div>

                    <div class="field is-grouped is-grouped-centered mt-5">
                      <div class="control">
                        <button
                          type="submit"
                          class="button is-rounded is-large is-info"
                          class:is-loading="{saveIsLoading}"
                          on:click="{saveMeeting}"
                        >Save</button>
                      </div>
                      <div class="control">
                        <button
                          type="reset"
                          class="button is-rounded is-large"
                          on:click="{cancelEdit}"
                        >Cancel</button>
                      </div>
                    </div>
                  </form>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  </section>
</div>
