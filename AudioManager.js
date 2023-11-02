class AudioManager
{
    constructor() {
        this.audios = {};
        this.playing = {};
    }

    async addAudio(fileName, name) {
        this.audios[name] = new Audio(fileName);
        this.playing[name] = false;
        await this.audios[name].load();
    }

    play() {
        let audioM = this;
        Object.keys(this.audios).forEach(function (name) {
            if (audioM.playing[name])
                audioM.audios[name].play();
        });
    }

    start(name) {
        this.audios[name].currentTime = 0;
        this.audios[name].play();
        this.playing[name] = true;
    }

    loop(name) {
        this.audios[name].loop = true;
        this.start(name);
    }

    pause() {
        let audioM = this;
        Object.keys(this.audios).forEach(function (name) {
            if (audioM.playing[name])
                audioM.audios[name].pause();
        });
    }

    stop(name, fadeout = 0) {
        if (this.audios[name].currentTime < 0.1)
            return;

        this.audios[name].volume = 0.99;
        if (this.audios[name].volume == 1)
            fadeout = 0;
        this.audios[name].volume = 1;

        let audioM = this;

        if (fadeout == 0) {
            audioM.audios[name].pause();
            audioM.audios[name].currentTime = 0;
            audioM.audios[name].loop = false;
            audioM.playing[name] = false;
        }

        else {
            let tick = 10 * fadeout;

            let interval = setInterval(function () {
                if (audioM.audios[name].volume <= 0.01) {
                    audioM.audios[name].pause();
                    audioM.audios[name].currentTime = 0;
                    audioM.audios[name].loop = false;
                    audioM.audios[name].volume = 1;
                    audioM.playing[name] = false;
                    clearInterval(interval);
                }
                else
                    audioM.audios[name].volume -= 0.01;
            }, tick);
        }
    }

    stopAll(fadeout = 0) {
        let audioM = this;
        Object.keys(this.audios).forEach(function (name) {
            audioM.stop(name, fadeout);
        });
    }
}