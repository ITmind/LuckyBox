<style>
</style>

<script>
    import Navbar from "./Components/Navbar.svelte";
    // import Pages from "./Components/Pages.svelte";
    import Footer from "./Components/Footer.svelte";
    import { startInterval, stopInterval, globalSensorsJson } from "./process.js";

    startInterval();

    let current_page;
    // import MyBtn from "./Components/myBtn.svelte";

    //Запуск аудио
    // let audio = document.getElementById("alert_audio");
    // let playAudio = false;
    // function stopSound() {
    //     audio.loop = false;
    //     audio.pause();
    //     if (isMobile && window.navigator && window.navigator.vibrate) {
    //         window.navigator.vibrate(0);
    //     }
    //     // audio.currentTime = 0;
    //     playAudio = false;
    // }
    // function playSound() {
    //     if (!playAudio && audio !== undefined) {
    //         audio.load();

    //         playAudio = true;
    //         audio.loop = true;
    //         audio.play();
    //         // Вибрация поддерживается
    //         if (isMobile && window.navigator && window.navigator.vibrate) {
    //             navigator.vibrate(1000);
    //         }
    //         setTimeout(function () {
    //             audio.currentTime = 0;
    //             stopSound();
    //         }, 5000);
    //     }
    // }
</script>

<Navbar bind:selected_page={current_page} />

<svelte:component this={current_page} />

<!-- <Pages /> -->
<Footer />

<!-- <audio id="alert_audio" preload="none">
    <source src="/data_uncompressed/beep.mp3" type="audio/mpeg; codecs='mp3'" />
    <source src="/data_uncompressed/beep.ogg" type="audio/ogg; codecs='vorbis'" />
</audio> -->
