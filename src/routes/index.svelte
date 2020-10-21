<script>
    const meeting = {
        title: 'Mr Selix',
        description: 'Morning Tasks.  Could be anything.  Add links here too.  http://www.example.com',
        startTime: new Date(2020,9,21,8,30),
        lengthInMinutes: 60, // minutes
        days: [1, 3, 5], // 0-6 Sunday-Saturday
        meetingUrl: 'http://foo.com',
    }

    function formatDate(date) {
        return date.toLocaleString('en-US', {timeStyle: 'short'})
    }
</script>

<style>

</style>

<svelte:head>
    <title>Tinsey | Where am I supposed to be rn?</title>
</svelte:head>


<section class="section is-fullwidth">
    <div class="hero">
    <div class="hero-body has-background-info-light has-text-centered">
        <div class="container">
            <h1 class="title is-family-sans-serif" style="font-size: 4rem;">Where am I supposed to be rn? 🤔</h1>
        </div>
    </div>
    </div>
</section>
<div class="container is-max-widescreen">
<section class="section">
    <nav class="level is-mobile is-family-code has-text-grey">
        <div class="level-left">
            <div class="level-item">
                <p class="content is-size-3">Wednesday</p>
            </div>
        </div>
        <div class="level-right">
            <div class="level-item">
                <p class="content is-size-3">9:45 AM</p>
            </div>
        </div>
    </nav>
    <div class="container">
        <div class="card">
            <div class="card-header">
                <div class="card-header-title is-centered">
                    <h1 class="title is-1">{meeting.title}</h1>
                </div>
            </div>
            <div class="card-content has-text-centered has-text-light has-background-grey">
                <div class="columns">
                    <div class="column">
                        <p class="content is-size-3">{formatDate(meeting.startTime)}</p>
                    </div>
                    <div class="column">
                        <p class="content is-size-3">{meeting.lengthInMinutes} minutes</p>
                    </div>
                    <div class="column">
                        <p class="content is-size-3 is-italic">15 mins left</p>
                    </div>
                </div>

            </div>
            <div class="card-content has-text-centered">
                <p class="content is-size-4">{@html meeting.description}</p>
            </div>

            <div class="card-footer">
                <div class="card-footer-item">
                    <a class="button is-large is-link" href={meeting.meetingUrl} target="_blank" rel="noreferrer" style="height: unset;"><h1 class="is-1 m-1">Join</h1></a>
                </div>
            </div>
        </div>
    </div>
</section></div>